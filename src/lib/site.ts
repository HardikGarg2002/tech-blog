export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Tech Blog",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  description:
    "A production-ready engineering journal for technical writing, project documentation, and searchable implementation notes.",
} as const;
