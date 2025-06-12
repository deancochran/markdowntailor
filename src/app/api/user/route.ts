import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { apiRateLimiter } from "@/lib/upstash";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimit = await apiRateLimiter.limit(session.user.id);
  if (!rateLimit.success) {
    return new Response("Too Many Requests", {
      status: 429,
    });
  }

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return NextResponse.json(userData);
}
