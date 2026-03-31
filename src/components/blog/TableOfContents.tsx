"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from the document
    const elements = Array.from(document.querySelectorAll("h2, h3"))
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: (el as HTMLElement).innerText,
        level: parseInt(el.tagName.replace("H", "")),
      }));
    setHeadings(elements);

    // Set active heading based on scroll position
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    document.querySelectorAll("h2, h3").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden h-fit max-h-[calc(100vh-8rem)] w-64 overflow-y-auto rounded-xl border bg-card p-6 lg:block">
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          On this page
        </h4>
        <ul className="flex flex-col gap-3">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "text-sm transition-colors hover:text-primary",
                heading.level === 3 && "pl-4",
                activeId === heading.id
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              )}
            >
              <a href={`#${heading.id}`} className="block">
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
