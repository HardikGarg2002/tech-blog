import { Github, Rss } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Tech Blog. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/rss.xml" className="text-muted-foreground hover:text-foreground">
            <Rss className="h-5 w-5" />
            <span className="sr-only">RSS Feed</span>
          </Link>
          <Link href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
