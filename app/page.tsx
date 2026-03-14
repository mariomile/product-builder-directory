import { Suspense } from "react";
import { ResourceGrid } from "@/components/resource-grid";
import { SearchBar } from "@/components/search-bar";
import { Filters } from "@/components/filters";
import { ResourceGridSkeleton } from "@/components/resource-skeleton";
import { getResourceCount } from "@/lib/queries";
import { CmdKHint } from "@/components/cmdk-hint";
import { Typewriter } from "@/components/typewriter";

type SearchParams = {
  search?: string;
  type?: string;
  pillar?: string;
  level?: string;
  free?: string;
  page?: string;
};

async function ResourceCountDisplay() {
  const count = await getResourceCount();
  return <span>[{count} resources]</span>;
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav — terminal titlebar */}
      <nav className="w-full border-b border-border">
        <div className="w-full max-w-6xl mx-auto px-5 h-10 flex items-center text-xs text-muted-foreground font-mono">
          <span className="text-foreground font-bold">product_builder_dir</span>
          <div className="flex-1 flex justify-center">
            <CmdKHint />
          </div>
          <div className="flex items-center gap-6">
            <span>v1.0</span>
            <Suspense fallback={<span>[-- resources]</span>}>
              <ResourceCountDisplay />
            </Suspense>
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 flex flex-col">
        {/* Hero */}
        <section className="py-12 border-b border-border">
          <p
            className="text-xs text-muted-foreground font-mono mb-5 animate-boot"
            style={{ animationDelay: "60ms" }}
          >
            // curated resources for product builders
          </p>
          <h1
            aria-label="Product Builder Directory"
            className="text-[clamp(3.5rem,11vw,9rem)] font-black uppercase tracking-tighter leading-[0.85]"
          >
            <div aria-hidden="true" className="animate-boot" style={{ animationDelay: "160ms" }}>
              Product
            </div>
            <div aria-hidden="true" className="animate-boot" style={{ animationDelay: "270ms" }}>
              Builder
            </div>
            <div aria-hidden="true" className="animate-boot cursor-blink" style={{ animationDelay: "380ms" }}>
              Directory
            </div>
          </h1>
          <p
            className="mt-8 text-muted-foreground max-w-lg leading-relaxed animate-boot"
            style={{ animationDelay: "520ms" }}
          >
            <Typewriter
              text="Evita il noise. Solo le migliori risorse sul Product Building, testate e curate da un team di esperti."
              speed={25}
              startDelay={800}
            />
          </p>
        </section>

        {/* Search + Filters */}
        <section className="py-8 border-b border-border flex flex-col gap-4">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <Filters />
          </Suspense>
        </section>

        {/* Results */}
        <section className="py-8 flex-1">
          <Suspense fallback={<ResourceGridSkeleton />}>
            <ResourceGridWrapper searchParamsPromise={searchParams} />
          </Suspense>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border text-center py-6 text-xs text-muted-foreground font-mono flex flex-col gap-1">
        <p>
          // curated by{" "}
          <a
            href="https://linkedin.com/in/mariomiletta"
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:text-primary transition-colors"
          >
            Mario Miletta
          </a>
          {" "}— built with Next.js, Supabase &amp; Claude Code
        </p>
        <p className="text-muted-foreground/40 hidden md:block">
          // vim: j/k navigate, o open, ⌘K search
        </p>
      </footer>
    </main>
  );
}

async function ResourceGridWrapper({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<SearchParams>;
}) {
  const params = await searchParamsPromise;
  return <ResourceGrid searchParams={params} />;
}
