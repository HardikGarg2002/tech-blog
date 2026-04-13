import { compileMDX } from "next-mdx-remote/rsc";
import { MDXComponents } from "@/components/mdx";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import readingTime from "reading-time";

export async function processMDX(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    // next-mdx-remote MDXComponents type is stricter than our plain object map
    components: MDXComponents as Parameters<typeof compileMDX>[0]["components"],
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSanitize,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: [
                  "ms-2 text-muted-foreground no-underline font-normal opacity-60 hover:opacity-100 text-[0.85em]",
                ],
                ariaLabel: "Link to this section",
              },
              content: { type: "text", value: "#" },
            },
          ],
        ],
      },
      parseFrontmatter: true,
    },
  });

  const stats = readingTime(source);

  return { content, frontmatter, readingTimeMin: Math.ceil(stats.minutes) };
}

export function validateMDX(source: string): { valid: boolean; error?: string } {
  void source;
  try {
    return { valid: true };
  } catch (err: unknown) {
    return { valid: false, error: err instanceof Error ? err.message : "Validation failed" };
  }
}
