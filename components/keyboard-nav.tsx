"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function KeyboardNav({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const focusedIndexRef = useRef(-1);

  // Keep ref in sync with state
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const getCards = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>("[data-card-index]")
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      const dialog = document.querySelector("[role='dialog']");
      if (dialog) return;

      const cards = getCards();
      if (cards.length === 0) return;

      switch (e.key) {
        case "j": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = Math.min(prev + 1, cards.length - 1);
            cards[next]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            return next;
          });
          break;
        }
        case "k": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            cards[next]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            return next;
          });
          break;
        }
        case "o":
        case "Enter": {
          const idx = focusedIndexRef.current;
          if (idx >= 0 && idx < cards.length) {
            e.preventDefault();
            const link = cards[idx];
            const href = link?.getAttribute("href");
            if (href) window.open(href, "_blank", "noopener,noreferrer");
          }
          break;
        }
        case "Escape": {
          setFocusedIndex(-1);
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [getCards]);

  // Apply/remove focused styling
  useEffect(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      if (i === focusedIndex) {
        card.setAttribute("data-focused", "true");
      } else {
        card.removeAttribute("data-focused");
      }
    });
  }, [focusedIndex, getCards]);

  // Reset focus when children change (page/filter navigation)
  useEffect(() => {
    setFocusedIndex(-1);
  }, [children]);

  // Touch support: highlight card on touchstart before link opens
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!target) return;
      const card = (target as HTMLElement).closest<HTMLElement>("[data-card-index]");
      if (!card) return;
      const cards = getCards();
      const idx = cards.indexOf(card);
      if (idx !== -1) setFocusedIndex(idx);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => container.removeEventListener("touchstart", handleTouchStart);
  }, [getCards]);

  return <div ref={containerRef}>{children}</div>;
}
