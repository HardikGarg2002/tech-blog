/** UI- and API-layer friendly enums (no `@prisma/client`). Keep values in sync with Prisma schema. */

export const POST_TYPES = ["CONCEPT", "TOOL", "PROJECT_WRITEUP"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const PROJECT_ITEM_TYPES = ["DOC", "POST"] as const;
export type ProjectItemType = (typeof PROJECT_ITEM_TYPES)[number];

export function parsePostType(value: string | undefined | null): PostType | undefined {
  if (!value) return undefined;
  return (POST_TYPES as readonly string[]).includes(value) ? (value as PostType) : undefined;
}
