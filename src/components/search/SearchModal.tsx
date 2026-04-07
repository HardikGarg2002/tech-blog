"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, SearchIcon, Loader2, Command, FileText, Code } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SearchResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex h-10 w-full items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground ring-offset-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-64">
          <SearchIcon className="h-4 w-4" />
          <span className="flex-1 text-left">Search notes...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span>/</span>
          </kbd>
        </button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-[550px] gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search all documentation..."
              className="border-none focus-visible:ring-0 text-lg p-0 h-auto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
        </DialogHeader>
        <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin">
          {results.length > 0 ? (
            <div className="flex flex-col gap-1 p-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/${result.type === "post" ? "blog" : "projects"}/${result.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors group"
                >
                  <div className="mt-0.5 rounded-md border bg-background p-1 text-muted-foreground group-hover:text-primary transition-colors">
                    {result.type === "post" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Code className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{result.title}</span>
                      <Badge variant="outline" className="capitalize text-[10px] h-4">
                        {result.type}
                      </Badge>
                    </div>
                    {result.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : query && !loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
              <Command className="h-10 w-10 opacity-20" />
              <p>
                No results found for <span className="font-medium text-foreground">{query}</span>.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <p>Search through blog posts, category documents, and project case studies.</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center border-t p-3 bg-muted/30 text-[10px] text-muted-foreground gap-1.5 uppercase font-bold tracking-widest leading-none">
          <kbd className="rounded border bg-background px-1.5 py-0.5">Esc</kbd> close
          <span className="mx-2 opacity-30">•</span>
          <kbd className="rounded border bg-background px-1.5 py-0.5">Enter</kbd> navigate
        </div>
      </DialogContent>
    </Dialog>
  );
}
