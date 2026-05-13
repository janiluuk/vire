import { describe, expect, it } from "vitest";
import { POST as orderLookupPost } from "@/app/api/public/order-lookup/route";

describe("POST /api/public/order-lookup", () => {
  it("returns 400 for invalid JSON", async () => {
    const res = await orderLookupPost(
      new Request("http://localhost/api/public/order-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.70",
        },
        body: "{",
      }),
    );
    expect(res.status).toBe(400);
    const j = (await res.json()) as { code?: string };
    expect(j.code).toBe("invalid_input");
  });

  it("returns 400 when body fails validation", async () => {
    const res = await orderLookupPost(
      new Request("http://localhost/api/public/order-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.71",
        },
        body: JSON.stringify({
          orderId: "short",
          email: "not-an-email",
        }),
      }),
    );
    expect(res.status).toBe(400);
    const j = (await res.json()) as { code?: string };
    expect(j.code).toBe("invalid_input");
  });

  it("returns 404 for well-formed but non-existent order (no data leak)", async () => {
    const res = await orderLookupPost(
      new Request("http://localhost/api/public/order-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.72",
        },
        body: JSON.stringify({
          orderId: "clnonexistentorderid0000000000",
          email: "nobody@example.com",
        }),
      }),
    );
    expect(res.status).toBe(404);
    const j = (await res.json()) as { ok?: boolean; code?: string };
    expect(j.ok).toBe(false);
    expect(j.code).toBe("not_found");
  });
});
