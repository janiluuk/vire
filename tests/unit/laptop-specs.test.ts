import { describe, expect, it } from "vitest";
import {
  extractJsonObject,
  parseAiInsight,
} from "@/lib/specs/laptop-specs";

describe("laptop-specs AI JSON parsing", () => {
  it("parses fenced JSON", () => {
    const raw = 'Here you go:\n```json\n{"summary":"Hyvä","specPageUrl":"https://notebookcheck.net/x"}\n```';
    const o = extractJsonObject(raw);
    expect(parseAiInsight(o)).toEqual({
      summary: "Hyvä",
      specUrl: "https://notebookcheck.net/x",
    });
  });

  it("rejects invalid spec URL", () => {
    const o = extractJsonObject('{"summary":"A","specPageUrl":"ftp://bad"}');
    expect(parseAiInsight(o)).toEqual({ summary: "A", specUrl: null });
  });
});
