import fs from "node:fs";
import path from "node:path";

export function guideMdxPath(slug: string): string {
  return path.join(process.cwd(), "content", "guides", `${slug}.mdx`);
}

export function readGuideMdxSource(slug: string): string | null {
  const p = guideMdxPath(slug);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}
