import { describe, expect, it } from "vitest";
import { parseModelsListParams } from "@/lib/admin/models-query";

describe("parseModelsListParams", () => {
  it("parses search query and status", () => {
    const { where, page, q } = parseModelsListParams({
      q: "thinkpad",
      status: "APPROVED",
      page: "2",
    });
    expect(q).toBe("thinkpad");
    expect(page).toBe(2);
    expect(where.status).toBe("APPROVED");
    expect(where.OR).toBeDefined();
  });

  it("defaults page to 1", () => {
    const { page } = parseModelsListParams({});
    expect(page).toBe(1);
  });
});
