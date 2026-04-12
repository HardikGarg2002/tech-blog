"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="container flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Application error
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              We hit an unexpected error while rendering this page.
            </p>
            {error.digest ? (
              <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
