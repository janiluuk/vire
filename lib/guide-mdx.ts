import matter from "gray-matter";

export type GuideFrontmatter = {
  slug: string;
  titleFi: string;
  difficulty: string;
  minutes: number;
  videoUrl?: string;
};

export function parseGuideMdx(source: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const parsed = matter(source);
  return { data: parsed.data as Record<string, unknown>, content: parsed.content };
}

export function stringifyGuideMdx(
  body: string,
  data: Record<string, string | number | undefined>,
): string {
  const cleaned: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== "") cleaned[k] = v;
  }
  return matter.stringify(body.trim(), cleaned);
}
