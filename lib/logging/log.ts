import { randomUUID } from "node:crypto";

function structuredJsonLogs(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.STRUCTURED_LOG === "1"
  );
}

/** Prefer client/proxy-provided id when present (max 128 chars). */
export function getRequestId(req: Request): string {
  const raw =
    req.headers.get("x-request-id")?.trim() ||
    req.headers.get("x-correlation-id")?.trim();
  if (raw && raw.length > 0 && raw.length <= 128) {
    return raw;
  }
  return randomUUID();
}

export function logApiEvent(
  requestId: string,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  const payload = {
    ts: new Date().toISOString(),
    level: "info" as const,
    requestId,
    event,
    ...fields,
  };
  if (structuredJsonLogs()) {
    console.log(JSON.stringify(payload));
    return;
  }
  console.log(`[${requestId}] ${event}`, fields);
}
