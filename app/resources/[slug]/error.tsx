"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ResourceError({
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
    <div className="flex-1 flex flex-col items-center justify-center font-mono p-8">
      <div className="border border-destructive p-6 max-w-lg w-full">
        <p className="text-destructive text-xs uppercase tracking-widest mb-4">// resource error</p>
        <p className="text-sm mb-6">{error.message || "Failed to load resource."}</p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="text-xs border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors font-mono"
          >
            [ retry ]
          </button>
          <Link
            href="/"
            className="text-xs border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors font-mono"
          >
            [ back to directory ]
          </Link>
        </div>
      </div>
    </div>
  );
}
