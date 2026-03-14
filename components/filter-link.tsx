"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FilterLink({
  paramKey,
  value,
  children,
}: {
  paramKey: string;
  value: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        params.set(paramKey, value);
        router.push(`/?${params.toString()}`);
      }}
      className="hover:text-primary transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
