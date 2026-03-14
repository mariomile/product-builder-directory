"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function PaginationBar({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigate = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  if (totalPages <= 1) return null;

  const barLength = Math.min(totalPages, 10);
  const filled = Math.round((currentPage / totalPages) * barLength);
  const empty = barLength - filled;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="disabled:opacity-30 hover:text-foreground transition-colors"
      >
        [&lt;]
      </button>
      <span className="flex items-center">
        [
        <span className={`text-primary ${isPending ? "cursor-blink" : ""}`}>
          {"█".repeat(Math.max(filled, 1))}
        </span>
        <span className="text-muted-foreground/30">
          {"░".repeat(Math.max(empty, 0))}
        </span>
        ]{" "}
        {currentPage}/{totalPages}
      </span>
      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
        className="disabled:opacity-30 hover:text-foreground transition-colors"
      >
        [&gt;]
      </button>
    </div>
  );
}
