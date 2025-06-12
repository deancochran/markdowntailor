import { NextAuthRequest } from "next-auth";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { middlewareRateLimiter } from "./lib/upstash";

// src/hooks.server.ts
const ALPHA_ACCESS_CUTOFF = new Date("2025-08-01T00:00:00Z");

export default async function middleware(
  request: NextRequest,
  _event: NextFetchEvent,
): Promise<Response | undefined> {
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

  // Apply general rate limiter (API has its own)
  const { success } = await middlewareRateLimiter.limit(ip);
  if (!success) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  // Only apply alpha cutoff to protected routes
  const isProtected = pathname.startsWith("/(protected)");
  if (isProtected && new Date() > ALPHA_ACCESS_CUTOFF) {
    return new Response("Alpha access ended. Thank you for testing!", {
      status: 403,
    });
  }

  return NextResponse.next();
}

export async function auth(req: NextAuthRequest) {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
