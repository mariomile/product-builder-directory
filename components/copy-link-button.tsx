"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Copy link"
      className="flex items-center gap-1 text-xs font-mono text-muted-foreground opacity-0 -translate-y-0.5 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 hover:text-primary focus-visible:opacity-100 focus-visible:text-primary outline-none"
    >
      {copied ? (
        <span className="text-primary">copied!</span>
      ) : (
        <Link2 className="h-3 w-3" />
      )}
    </button>
  );
}
