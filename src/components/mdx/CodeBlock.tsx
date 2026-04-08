import type { ReactNode } from "react";
import { CodeBlockCopyButton } from "./CodeBlockCopyButton";

interface CodeBlockProps {
  children: ReactNode;
  code: string;
  language?: string;
  filename?: string;
}

/** Server component: highlighted body SSR’d; copy control is a small client island. */
export function CodeBlock({ children, code, language, filename }: CodeBlockProps) {
  return (
    <div className="relative my-6 overflow-hidden rounded-lg border bg-zinc-950 dark:bg-zinc-900 shadow-sm group">
      <div className="flex h-11 items-center justify-between border-b px-4 bg-muted/50">
        <div className="flex items-center gap-2">
          {language ? (
            <span className="text-[10px] font-bold uppercase text-muted-foreground bg-background px-2 py-0.5 rounded border">
              {language}
            </span>
          ) : null}
          {filename ? (
            <span className="text-xs font-mono text-muted-foreground pl-2 border-l border-muted-foreground/30 ml-1">
              {filename}
            </span>
          ) : null}
        </div>
        <CodeBlockCopyButton code={code} />
      </div>

      <div className="relative overflow-x-auto p-4 text-sm scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {children}
      </div>
    </div>
  );
}
