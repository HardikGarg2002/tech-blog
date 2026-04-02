"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Results {query && `for "${query}"`}
          </h1>
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `${results.length} results found.`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 max-w-3xl">
            {results.map((result) => (
              <Link key={result.id} href={`/${result.type === "post" ? "blog" : "projects"}/${result.slug}`}>
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
                      <CardDescription className="line-clamp-2">
                        {result.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}

            {query && !loading && results.length === 0 && (
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
        )}
      </div>
    </div>
  );
}
