import { describe, expect, it } from "vitest";
import { validatePhotoPayload } from "@/lib/specs/validate-photo";

describe("validatePhotoPayload", () => {
  const tinyJpeg = Buffer.alloc(48, 0xff).toString("base64");

  it("accepts small valid jpeg payload", () => {
    const result = validatePhotoPayload(tinyJpeg, "image/jpeg");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.bytes.length).toBeGreaterThan(0);
  });

  it("rejects unsupported mime type", () => {
    const result = validatePhotoPayload(tinyJpeg, "image/gif");
    expect(result).toEqual({ ok: false, code: "unsupported_type" });
  });

  it("rejects invalid base64", () => {
    const result = validatePhotoPayload("!!!", "image/jpeg");
    expect(result).toEqual({ ok: false, code: "invalid_image" });
  });

  it("rejects oversized payload", () => {
    const big = Buffer.alloc(2_500_001, 1).toString("base64");
    const result = validatePhotoPayload(big, "image/jpeg");
    expect(result).toEqual({ ok: false, code: "image_too_large" });
  });
});
