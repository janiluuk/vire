/** Resize and compress a user photo before upload (keeps payload small). */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

export async function compressPhotoFile(file: File): Promise<{
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}> {
  const mime = file.type;
  if (
    mime !== "image/jpeg" &&
    mime !== "image/png" &&
    mime !== "image/webp"
  ) {
    throw new Error("unsupported_type");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode_failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return {
    base64: btoa(binary),
    mimeType: "image/jpeg",
  };
}
