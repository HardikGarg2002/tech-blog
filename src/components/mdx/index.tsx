import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { Info, AlertTriangle, Flame, Lightbulb, Folder, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeRenderer } from "./CodeRenderer";

const linkClassName =
  "font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all underline-thickness-[2px]";

function MdxLink({ href, children, className, ...props }: ComponentProps<"a">) {
  const cls = cn(linkClassName, className);

  if (!href) {
    return (
      <a className={cls} {...props}>
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  if (/^(mailto:|tel:)/i.test(href)) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
      {children}
    </a>
  );
}

const calloutVariants = cva("my-6 flex gap-3 rounded-lg border p-4 text-sm", {
  variants: {
    type: {
      info: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100",
      warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
      danger: "border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/20",
      tip: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
    },
  },
  defaultVariants: { type: "info" },
});

const calloutIcons = {
  info: Info,
  warning: AlertTriangle,
  danger: Flame,
  tip: Lightbulb,
} as const;

export type CalloutType = keyof typeof calloutIcons;

export function Callout({
  type = "info",
  children,
  className,
  title,
}: {
  type?: CalloutType;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  const Icon = calloutIcons[type];
  return (
    <aside
      className={cn(calloutVariants({ type }), className)}
      role="note"
      data-callout={type}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0 space-y-2 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_p:first-child]:mt-0">
        {title ? <p className="font-semibold leading-none text-inherit">{title}</p> : null}
        <div className="leading-relaxed text-inherit [&_a]:underline [&_code]:text-inherit">{children}</div>
      </div>
    </aside>
  );
}

export function Step({
  children,
  number = 1,
  title,
}: {
  children: ReactNode;
  number?: number;
  title?: string;
}) {
  return (
    <div className="relative flex gap-4 rounded-lg border bg-card/60 p-4 shadow-sm">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm"
        aria-hidden
      >
        {number}
      </div>
      <div className="min-w-0 flex-1 space-y-2 [&_p]:mb-3 [&_p:last-child]:mb-0">
        {title ? <p className="font-semibold text-foreground">{title}</p> : null}
        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  let n = 0;
  const numbered = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (child.type !== Step) return child;
    n += 1;
    return cloneElement(child as ReactElement<{ number?: number }>, { number: n });
  });

  return <div className="my-8 flex flex-col gap-5">{numbered}</div>;
}

export function FileTree({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-6 overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-[0.8125rem] leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FileTreeFolder({
  name,
  children,
}: {
  name: string;
  children?: ReactNode;
}) {
  return (
    <div className="select-none">
      <div className="flex items-center gap-2 py-0.5 text-foreground">
        <Folder className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
        <span>{name}/</span>
      </div>
      {children ? (
        <div className="ml-[0.85rem] border-l border-border/90 pl-3">{children}</div>
      ) : null}
    </div>
  );
}

export function FileTreeFile({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-muted-foreground">
      <File className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <span className="text-foreground/90">{name}</span>
    </div>
  );
}

export const MDXComponents = {
  Callout,
  Steps,
  Step,
  FileTree,
  FileTreeFolder,
  FileTreeFile,

  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl border-b pb-4 mb-6"
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4 border-b pb-2"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
  ol: (props: ComponentProps<"ol">) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
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
  /** Fenced blocks render from `code`; keep `pre` transparent so we do not nest duplicate wrappers. */
  pre: ({ children }: ComponentProps<"pre">) => <>{children}</>,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground bg-muted/30 py-4 rounded-r-lg"
      {...props}
    />
  ),
  a: MdxLink,
};
