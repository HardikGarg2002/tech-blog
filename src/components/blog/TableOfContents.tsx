"use client";

import { useEffect, useState } from "react";
import { TableOfContentsNav, type TocHeading } from "./TableOfContentsNav";

type Props = {
  /** When provided (e.g. from server-parsed MDX), TOC markup is available on first paint; observer still runs for active heading. */
  headings?: TocHeading[];
};

export function TableOfContents({ headings: headingsProp }: Props) {
  const [derivedHeadings, setDerivedHeadings] = useState<TocHeading[]>(() => {
    if (typeof document === "undefined") {
      return [];
    }

    return Array.from(document.querySelectorAll("h2, h3"))
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: (el as HTMLElement).innerText,
        level: parseInt(el.tagName.replace("H", ""), 10),
      }));
  });
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headingsProp?.length) {
      return;
    }

    const elements = Array.from(document.querySelectorAll("h2, h3"))
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: (el as HTMLElement).innerText,
        level: parseInt(el.tagName.replace("H", ""), 10),
      }));

    queueMicrotask(() => setDerivedHeadings(elements));
  }, [headingsProp]);

  const headings = headingsProp?.length ? headingsProp : derivedHeadings;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );

    document.querySelectorAll("h2, h3").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  return <TableOfContentsNav headings={headings} activeId={activeId} />;
}
