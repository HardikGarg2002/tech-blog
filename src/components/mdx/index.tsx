import type { ComponentProps } from "react";
import { CodeRenderer } from "./CodeRenderer";

export const MDXComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl border-b pb-4 mb-6" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4 border-b pb-2" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  code: ({ children, className, ...props }: ComponentProps<"code">) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      const codeText =
        typeof children === "string"
          ? children
          : Array.isArray(children)
            ? children.map(String).join("")
            : String(children ?? "");
      const lang = className!.replace("language-", "");
      return <CodeRenderer code={codeText} lang={lang} />;
    }
    return (
      <code
        className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-primary"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: ComponentProps<"pre">) => <>{children}</>,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground bg-muted/30 py-4 rounded-r-lg" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a className="font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all underline-thickness-[2px]" {...props} />
  ),
};
