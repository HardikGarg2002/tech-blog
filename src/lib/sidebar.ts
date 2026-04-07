import { ProjectItemWithRelations, ProjectSectionWithItems, SidebarTree } from "@/types";

export function buildSidebarTree(
  items: ProjectItemWithRelations[],
  sections: ProjectSectionWithItems[]
): SidebarTree {
  const addedSections = new Set<string>();
  const tree: SidebarTree = [];

  const allEntries = [
    ...items.map((item) => ({
      kind: "item" as const,
      item,
      order: item.order,
      sectionId: item.sectionId,
    })),
    ...sections.map((section) => ({
      kind: "section-header" as const,
      section,
      order: section.order,
      sectionId: null,
    })),
  ].sort((a, b) => a.order - b.order);

  for (const entry of allEntries) {
    if (entry.kind === "section-header") {
      if (!addedSections.has(entry.section.id)) {
        const sectionItems = items
          .filter((i) => i.sectionId === entry.section.id)
          .sort((a, b) => a.order - b.order);
        tree.push({ kind: "section", section: entry.section, items: sectionItems });
        addedSections.add(entry.section.id);
      }
    } else if (!entry.sectionId) {
      tree.push({ kind: "item", item: entry.item });
    }
  }

  return tree;
}

export function flattenSidebarItems(tree: SidebarTree): ProjectItemWithRelations[] {
  const result: ProjectItemWithRelations[] = [];
  for (const entry of tree) {
    if (entry.kind === "item") {
      result.push(entry.item);
    } else {
      result.push(...entry.items);
    }
  }
  return result;
}
