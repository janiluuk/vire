/** URL segment for a computer model detail page (make + model). */
export function computerModelSlug(make: string, model: string): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  return `${norm(make)}-${norm(model)}`.replace(/-+/g, "-").replace(/^-|-$/g, "");
}
