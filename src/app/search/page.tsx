import Link from "next/link";
import { Search } from "lucide-react";
import { runSiteSearch } from "@/actions/search";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await props.searchParams;
  const query = q.trim();

  const searchResult = await runSiteSearch(query);
  const results = searchResult.ok ? searchResult.data : [];
  const error = !searchResult.ok ? searchResult.error : null;

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Results
          </h1>
        </div>

        {error && (
          <p className="text-destructive text-sm border border-destructive/30 rounded-lg px-4 py-3 bg-destructive/5">
            {error}
          </p>
        )}

        <p className="text-muted-foreground">
          {query ? `${results.length} results found.` : "Enter a search query to browse content."}
        </p>

        <div className="grid gap-4 max-w-3xl">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/${result.type === "post" ? "blog" : "projects"}/${result.slug}`}
            >
              <Card className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {result.type}
                      </Badge>
                      <div className="flex gap-1">
                        {result.categories.map((cat) => (
                          <span key={cat} className="text-[10px] text-muted-foreground">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{result.title}</CardTitle>
                  {result.excerpt && (
                    <CardDescription className="line-clamp-2">{result.excerpt}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}

          {query && !error && results.length === 0 && (
            <div className="py-24 text-center border rounded-xl bg-muted/50">
              <p className="text-muted-foreground">No matches found. Try different keywords.</p>
            </div>
          )}

          {!query && (
            <div className="py-24 text-center border rounded-xl bg-muted/50">
              <p className="text-muted-foreground">Enter a search query to browse content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
