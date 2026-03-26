import slugifyLib from "slugify";

export function toSlug(input: string): string {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(
  base: string,
  checkFn: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = toSlug(base);
  let exists = await checkFn(slug);
  let counter = 2;
  while (exists) {
    slug = `${toSlug(base)}-${counter}`;
    exists = await checkFn(slug);
    counter++;
  }
  return slug;
}
