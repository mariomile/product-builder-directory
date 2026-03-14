"use client";

import { useState, useEffect } from "react";

export function Typewriter({
  text,
  speed = 30,
  startDelay = 0,
  className,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(startDelay === 0);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setDisplayedCount(text.length);
      setDone(true);
      setStarted(true);
      return;
    }

    if (startDelay > 0) {
      const delay = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(delay);
    }
  }, [text, startDelay]);

  useEffect(() => {
    if (!started || done) return;

    const interval = setInterval(() => {
      setDisplayedCount((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          setDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [started, done, text, speed]);

  return (
    <span aria-label={text} className={className}>
      <span aria-hidden="true">
        {text.slice(0, displayedCount)}
        {started && !done && <span className="cursor-blink" />}
      </span>
    </span>
  );
}
