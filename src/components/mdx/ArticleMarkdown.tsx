import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import matter from "gray-matter";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { cn } from "@/lib/utils";

const linkClass =
  "font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all underline-thickness-[2px]";

const autolinkOptions = {
  behavior: "append" as const,
  properties: {
    className: [
      "ms-2 text-muted-foreground no-underline font-normal opacity-60 hover:opacity-100 text-[0.85em]",
    ],
    ariaLabel: "Link to this section",
  },
  content: { type: "text" as const, value: "#" },
};

const rehypePlugins: NonNullable<Options["rehypePlugins"]> = [
  rehypeSlug,
  [rehypeAutolinkHeadings, autolinkOptions],
];

function MarkdownLink({
  href,
  children,
  ...props
}: ComponentPropsWithoutRef<"a">) {
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
}

function stripOptionalFrontmatter(raw: string): string {
  try {
    return matter(raw).content;
  } catch {
    return raw;
  }
}

type Props = {
  source: string;
  className?: string;
  /** `article` matches public post pages; `preview` matches the admin editor. */
  size?: "article" | "preview";
};

/**
 * Renders stored Markdown (GFM) the same way as the admin preview: react-markdown,
 * not MDX compilation. Optional YAML frontmatter is stripped like the old MDX path.
 */
export function ArticleMarkdown({ source, className, size = "article" }: Props) {
  const md = stripOptionalFrontmatter(source);

  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none text-foreground",
        size === "article" ? "prose-neutral" : "prose-sm",
        "[&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/50",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={{
          a: MarkdownLink,
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}
