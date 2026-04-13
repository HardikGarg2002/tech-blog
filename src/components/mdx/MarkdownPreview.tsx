"use client";

import { ArticleMarkdown } from "@/components/mdx/ArticleMarkdown";

type Props = {
  source: string;
  className?: string;
};

/** Admin preview: same pipeline as the public blog body (`ArticleMarkdown`, size preview). */
export function MarkdownPreview({ source, className }: Props) {
  return <ArticleMarkdown source={source} size="preview" className={className} />;
}
