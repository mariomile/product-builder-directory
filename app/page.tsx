import { Suspense } from "react";
import { ResourceGrid } from "@/components/resource-grid";
import { SearchBar } from "@/components/search-bar";
import { Filters } from "@/components/filters";

type SearchParams = {
  search?: string;
  type?: string;
  pillar?: string;
  level?: string;
  free?: string;
};

export default function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full flex justify-center border-b border-border/50 h-14">
        <div className="w-full max-w-6xl flex justify-between items-center px-5">
          <span className="font-semibold text-sm">
            Product Builder Directory
          </span>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 flex flex-col gap-8">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Product Builder Directory
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Evita il noise. Solo le migliori risorse sul Product Building,
            testate e curate da un team di esperti.
          </p>
        </section>

        {/* Search + Filters */}
        <section className="flex flex-col gap-4">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <Filters />
          </Suspense>
        </section>

        {/* Results — Suspense boundary for data fetching */}
        <Suspense
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          }
        >
          <ResourceGridWrapper searchParamsPromise={searchParams} />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t text-center text-xs py-8 text-muted-foreground">
        <p>
          Curated by{" "}
          <a
            href="https://linkedin.com/in/mariomiletta"
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            Mario Miletta
          </a>{" "}
          — Built with Next.js, Supabase &amp; Claude Code
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
