import {
  type LanguageModelV1,
  type LanguageModelV1Middleware,
  type LanguageModelV1StreamPart,
  simulateReadableStream,
} from "ai";
import { NextAuthRequest } from "next-auth";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { middlewareRateLimiter, redis } from "./lib/upstash";

export default async function middleware(
  request: NextRequest,
  _event: NextFetchEvent,
): Promise<Response | undefined> {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  // // Skip rate limiting in test environment
  if (!process.env.RATE_LIMITING_DISABLED) {
    const { success } = await middlewareRateLimiter.limit(ip);
    if (!success) {
      return NextResponse.redirect(new URL("/blocked", request.url));
    }
  }

  // Only apply alpha cutoff to protected routes
  const pathname = request.nextUrl.pathname;
  // Exclude auth routes from protection
  const protectedPaths = ["/resumes", "/settings", "/templates", "/api"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (
    isProtected &&
    new Date() >
      new Date(
        process.env.ALPHA_ACCESS_CUTOFF_DATE ??
          ("2025-08-01T00:00:00Z" as string),
      )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
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
     * - favicon.ico
     * - sitemap.xml
     * - robots.txt

     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export const cacheMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const cacheKey = JSON.stringify(params);

    const cached = (await redis.get(cacheKey)) as Awaited<
      ReturnType<LanguageModelV1["doGenerate"]>
    > | null;

    if (cached !== null) {
      return {
        ...cached,
        response: {
          ...cached.response,
          timestamp: cached?.response?.timestamp
            ? new Date(cached?.response?.timestamp)
            : undefined,
        },
      };
    }

    const result = await doGenerate();

    redis.set(cacheKey, result);

    return result;
  },
  wrapStream: async ({ doStream, params }) => {
    const cacheKey = JSON.stringify(params);

    // Check if the result is in the cache
    const cached = await redis.get(cacheKey);

    // If cached, return a simulated ReadableStream that yields the cached result
    if (cached !== null) {
      // Format the timestamps in the cached response
      const formattedChunks = (cached as LanguageModelV1StreamPart[]).map(
        (p) => {
          if (p.type === "response-metadata" && p.timestamp) {
            return { ...p, timestamp: new Date(p.timestamp) };
          } else return p;
        },
      );
      return {
        stream: simulateReadableStream({
          initialDelayInMs: 0,
          chunkDelayInMs: 10,
          chunks: formattedChunks,
        }),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    }

    // If not cached, proceed with streaming
    const { stream, ...rest } = await doStream();

    const fullResponse: LanguageModelV1StreamPart[] = [];

    const transformStream = new TransformStream<
      LanguageModelV1StreamPart,
      LanguageModelV1StreamPart
    >({
      transform(chunk, controller) {
        fullResponse.push(chunk);
        controller.enqueue(chunk);
      },
      flush() {
        // Store the full response in the cache after streaming is complete
        redis.set(cacheKey, fullResponse);
      },
    });

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    };
  },
};
