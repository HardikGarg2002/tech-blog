"use client";

import { SearchModal } from "@/components/search/SearchModal";
import { ThemeToggle } from "./ThemeToggle";

/** Client bundle: search dialog + theme (requires hooks / client-only APIs). Header shell stays a server component. */
export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <SearchModal />
      <ThemeToggle />
    </div>
  );
}
