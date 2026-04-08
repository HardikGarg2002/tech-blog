import { cn } from "@/lib/utils";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

type Props = {
  headings: TocHeading[];
  activeId: string;
};

/** Pure presentational TOC list — safe to render from a server parent inside a client wrapper via `children` slot, or from client with props. */
export function TableOfContentsNav({ headings, activeId }: Props) {
  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden h-fit max-h-[calc(100vh-8rem)] w-64 overflow-y-auto rounded-xl border bg-card p-6 lg:block">
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">On this page</h4>
        <ul className="flex flex-col gap-3">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "text-sm transition-colors hover:text-primary",
                heading.level === 3 && "pl-4",
                activeId === heading.id
                  ? "font-bold text-primary"
                  : "text-muted-foreground",
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
