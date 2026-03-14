"use client";

export function CmdKHint() {
  return (
    <button
      onClick={() => {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        );
      }}
      className="flex items-center gap-1.5 border border-border px-2 py-0.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      <kbd className="text-[10px] font-mono">⌘K</kbd>
    </button>
  );
}
