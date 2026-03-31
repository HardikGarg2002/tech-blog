"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  children: React.ReactNode;
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ children, code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border bg-zinc-950 dark:bg-zinc-900 shadow-sm group">
      {/* Header */}
      <div className="flex h-11 items-center justify-between border-b px-4 bg-muted/50">
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-[10px] font-bold uppercase text-muted-foreground bg-background px-2 py-0.5 rounded border">
              {language}
            </span>
          )}
          {filename && (
            <span className="text-xs font-mono text-muted-foreground pl-2 border-l border-muted-foreground/30 ml-1">
              {filename}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>

      {/* Content */}
      <div className="relative overflow-x-auto p-4 text-sm scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {children}
      </div>
    </div>
  );
}
