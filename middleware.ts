import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Phase 22 — permanent move; preserve query string (form ?sent= / ?err=). */
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const legacy = pathname.match(/^\/(fi|en)\/vire-for-good\/?$/);
  if (legacy) {
    const url = request.nextUrl.clone();
    url.pathname = `/${legacy[1]}/sparkki-for-good`;
    return NextResponse.redirect(url, 308);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fi|en)/:path*", "/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
