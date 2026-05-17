import { describe, expect, it } from "vitest";
import { parseComputerModelCsv } from "@/lib/admin/parse-computer-model-csv";

describe("parseComputerModelCsv", () => {
  it("parses header and rows", () => {
    const csv = `make,model,yearFrom,yearTo
Lenovo,ThinkPad T450,2015,2016
HP,EliteBook 840,,`;
    const { rows, errors } = parseComputerModelCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      make: "Lenovo",
      model: "ThinkPad T450",
      yearFrom: 2015,
      yearTo: 2016,
    });
    expect(rows[1]?.make).toBe("HP");
  });

  it("requires make and model columns", () => {
    const { rows, errors } = parseComputerModelCsv("model\nX1");
    expect(rows).toHaveLength(0);
    expect(errors[0]?.message).toBe("missing_headers");
  });
});
