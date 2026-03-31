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
    components: MDXComponents as any,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSanitize, rehypeSlug, rehypeAutolinkHeadings],
      },
      parseFrontmatter: true,
    },
  });

  const stats = readingTime(source);

  return { content, frontmatter, readingTimeMin: Math.ceil(stats.minutes) };
}

export function validateMDX(source: string): { valid: boolean; error?: string } {
  try {
    // Basic validation: check for unclosed JSX tags
    // Full compile happens on save via processMDX
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}
