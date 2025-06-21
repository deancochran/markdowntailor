import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { resume } from "@/db/schema";
import { apiRateLimiter } from "@/lib/upstash";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/resume/[id]
 * Fetches a single resume by its ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = params;

    // 1. Check Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const { id: userId } = session.user;

    // 2. Apply Rate Limiting
    const rateLimit = await apiRateLimiter.limit(userId);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    // 3. Fetch Resume from DB
    const [resumeData] = await db
      .select()
      .from(resume)
      .where(eq(resume.id, resumeId));

    // 4. Check if Resume Exists
    if (!resumeData) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 5. Verify Ownership
    if (resumeData.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not have access to this resume" },
        { status: 403 },
      );
    }

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error(`Failed to fetch resume ${params.id}:`, error);
    return NextResponse.json(
      {
        error: "Failed to fetch resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/resume/[id]
 * Deletes a single resume by its ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: resumeId } = params;

    // 1. Check Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const { id: userId } = session.user;

    // 2. Apply Rate Limiting
    const rateLimit = await apiRateLimiter.limit(userId);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    // 3. Verify Ownership before Deleting
    // We only need to select one column for an existence and ownership check.
    const [resumeData] = await db
      .select({ userId: resume.userId })
      .from(resume)
      .where(eq(resume.id, resumeId));

    if (!resumeData) {
      // If the resource doesn't exist, the DELETE operation can be considered successful (idempotent).
      return new NextResponse(null, { status: 204 });
    }

    if (resumeData.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete this resume" },
        { status: 403 },
      );
    }

    // 4. Delete the Resume
    await db.delete(resume).where(eq(resume.id, resumeId));

    return new NextResponse(null, { status: 204 }); // Standard successful DELETE response
  } catch (error) {
    console.error(`Failed to delete resume ${params.id}:`, error);
    return NextResponse.json(
      {
        error: "Failed to delete resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
