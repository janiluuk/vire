import { describe, expect, it } from "vitest";
import { GET, POST as cspReportPost } from "@/app/api/csp-report/route";

describe("POST /api/csp-report", () => {
  it("GET returns 405", () => {
    const res = GET();
    expect(res.status).toBe(405);
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await cspReportPost(
      new Request("http://localhost/api/csp-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/csp-report",
          "x-forwarded-for": "203.0.113.80",
        },
        body: "{",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 204 and accepts application/csp-report payload", async () => {
    const res = await cspReportPost(
      new Request("http://localhost/api/csp-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/csp-report",
          "x-forwarded-for": "203.0.113.81",
        },
        body: JSON.stringify({
          "csp-report": {
            "document-uri": "https://example.com/fi",
            "violated-directive": "script-src-elem",
            "blocked-uri": "inline",
            "disposition": "report",
          },
        }),
      }),
    );
    expect(res.status).toBe(204);
    const text = await res.text();
    expect(text).toBe("");
  });
});
