import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          The page you requested does not exist or is no longer publicly available.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back home
        </Link>
        <Link
          href="/search"
          className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Search content
        </Link>
      </div>
    </div>
  );
}
