import { NextResponse } from "next/server";
import { getRequestId, logApiEvent } from "@/lib/logging/log";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/http/rate-limit";

const MAX_BYTES = 65_536;

function summarizeCspBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { parse: "not_object" };
  }
  const root = body as Record<string, unknown>;
  const inner =
    root["csp-report"] && typeof root["csp-report"] === "object" && !Array.isArray(root["csp-report"])
      ? (root["csp-report"] as Record<string, unknown>)
      : root;
  return {
    documentUri: inner["document-uri"],
    violatedDirective: inner["violated-directive"],
    effectiveDirective: inner["effective-directive"],
    blockedUri: inner["blocked-uri"],
    disposition: inner["disposition"],
    sourceFile: inner["source-file"],
    lineNumber: inner["line-number"],
    columnNumber: inner["column-number"],
    referrer: inner["referrer"],
    statusCode: inner["status-code"],
    sample: inner["sample"],
  };
}

export function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}

/**
 * Browser CSP violation reports (`report-uri` / report-only or enforcing policy).
 * Returns **204** with an empty body on success (no JSON — some senders ignore bodies).
 */
export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const ip = getClientIpFromHeaders(req.headers);
  if (
    !(await checkRateLimit(`csp-report:${ip}`, {
      windowMs: 60_000,
      max: 120,
    }))
  ) {
    logApiEvent(requestId, "csp_report.rate_limited", { ip });
    return new NextResponse(null, { status: 429 });
  }

  const len = req.headers.get("content-length");
  if (len && /^\d+$/.test(len) && Number(len) > MAX_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    logApiEvent(requestId, "csp_report.read_error", { ip });
    return new NextResponse(null, { status: 400 });
  }
  if (raw.length > MAX_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let body: unknown;
  try {
    body = raw.length === 0 ? null : JSON.parse(raw);
  } catch {
    logApiEvent(requestId, "csp_report.invalid_json", { ip, bytes: raw.length });
    return new NextResponse(null, { status: 400 });
  }

  const summary = summarizeCspBody(body);
  logApiEvent(requestId, "csp_report.violation", { ip, ...summary });

  return new NextResponse(null, { status: 204 });
}
