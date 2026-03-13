"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        startTransition(() => {
          router.push(`/?${params.toString()}`);
        });
      }, 300);
    },
    [router, searchParams]
  );

  return (
    <div className="flex items-center w-full max-w-2xl border border-border bg-card h-12 px-4 focus-within:border-primary transition-colors">
      <span className="text-primary font-bold mr-3 flex-shrink-0 select-none text-base">
        {">"}
      </span>
      <input
        ref={inputRef}
        type="search"
        placeholder="search_resources..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground font-mono"
      />
      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
        {isPending && (
          <div className="h-3 w-3 border border-muted-foreground border-t-transparent animate-spin" />
        )}
        <span className="text-xs text-muted-foreground font-mono">⌘K</span>
      </div>
    </div>
  );
}
