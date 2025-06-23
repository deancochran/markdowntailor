import { auth } from "@/auth";
import { apiRateLimiter } from "@/lib/upstash";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      console.error("No session or user found:", session);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const rateLimit = await apiRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    return NextResponse.json(session.user);
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve user data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
