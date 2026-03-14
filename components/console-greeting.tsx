"use client";

import { useEffect } from "react";

export function ConsoleGreeting() {
  useEffect(() => {
    console.log(
      `%c
╔══════════════════════════════════════╗
║  product_builder_dir v1.0            ║
║  ─────────────────────────────       ║
║  > curious? you belong here.         ║
║  > built by Mario Miletta            ║
║  > powered by Next.js + Supabase     ║
╚══════════════════════════════════════╝
`,
      "color: #00ffff; font-family: monospace; font-size: 12px;"
    );
  }, []);

  return null;
}
