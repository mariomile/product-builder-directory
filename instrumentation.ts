export async function register() {
  // Only validate on Node.js runtime — not edge runtime or client bundles
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `[startup] Missing required environment variables:\n` +
          missing.map((k) => `  - ${k}`).join("\n") +
          `\n\nSee .env.example for required values.`
      );
    }
  }
}
