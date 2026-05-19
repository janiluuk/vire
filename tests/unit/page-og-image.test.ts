import { describe, expect, it } from "vitest";

describe("fetchOgImageUrl", () => {
  it("extracts og:image from HTML via fetch mock", async () => {
    const html = `<html><head>
      <meta property="og:image" content="https://cdn.example.com/laptop.jpg" />
    </head></html>`;

    const original = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(html, { status: 200 }) as Response;

    const { fetchOgImageUrl } = await import("@/lib/specs/page-og-image");
    const url = await fetchOgImageUrl("https://shop.example.com/specs");
    expect(url).toBe("https://cdn.example.com/laptop.jpg");

    globalThis.fetch = original;
  });
});
