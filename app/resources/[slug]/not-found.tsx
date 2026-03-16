import Link from "next/link";

export default function ResourceNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center font-mono p-8">
      <div className="max-w-lg w-full flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">// error</p>
        <h1 className="text-6xl font-black">404</h1>
        <p className="text-muted-foreground">
          resource not found. this entry may have been removed or never existed.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/"
            className="text-xs font-mono border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
          >
            [back to directory]
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-8 cursor-blink">
          $ cd /resources
        </p>
      </div>
    </main>
  );
}
