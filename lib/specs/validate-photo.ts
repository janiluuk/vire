const MAX_BYTES = 2_500_000;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validatePhotoPayload(
  base64: string,
  mimeType: string,
): { ok: true; bytes: Buffer } | { ok: false; code: string } {
  if (!ALLOWED.has(mimeType)) {
    return { ok: false, code: "unsupported_type" };
  }
  const cleaned = base64.replace(/\s/g, "");
  if (cleaned.length < 32) return { ok: false, code: "invalid_image" };
  let bytes: Buffer;
  try {
    bytes = Buffer.from(cleaned, "base64");
  } catch {
    return { ok: false, code: "invalid_image" };
  }
  if (bytes.length > MAX_BYTES) {
    return { ok: false, code: "image_too_large" };
  }
  return { ok: true, bytes };
}
