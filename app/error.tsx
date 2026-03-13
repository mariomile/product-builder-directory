"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-mono bg-background text-foreground p-8">
      <div className="border border-destructive p-6 max-w-lg w-full">
        <p className="text-destructive text-xs uppercase tracking-widest mb-4">// error</p>
        <p className="text-sm text-muted-foreground mb-2 font-mono">
          {error.digest ? `[digest: ${error.digest}]` : "[no digest]"}
        </p>
        <p className="text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="text-xs border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors font-mono"
        >
          [ retry ]
        </button>
      </div>
    </div>
  );
}
