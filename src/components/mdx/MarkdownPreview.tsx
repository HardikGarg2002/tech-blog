"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const linkClass =
  "font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all underline-thickness-[2px]";

type Props = {
  source: string;
  className?: string;
};

/**
 * Client-side Markdown preview (GFM). Matches common blog typography; custom MDX
 * components are not evaluated here—only what react-markdown understands.
 */
export function MarkdownPreview({ source, className }: Props) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-foreground",
        "[&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/50",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            if (!href) {
              return (
                <a className={linkClass} {...props}>
                  {children}
                </a>
              );
            }
            if (href.startsWith("#")) {
              return (
                <a href={href} className={linkClass} {...props}>
                  {children}
                </a>
              );
            }
            if (href.startsWith("/") && !href.startsWith("//")) {
              return (
                <Link href={href} className={linkClass}>
                  {children}
                </Link>
              );
            }
            if (/^(mailto:|tel:)/i.test(href)) {
              return (
                <a href={href} className={linkClass} {...props}>
                  {children}
                </a>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
