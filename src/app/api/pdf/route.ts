import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { resume, resumeVersions } from "@/db/schema";
import { apiRateLimiter, redis } from "@/lib/upstash";
import { generatePDFServerSide } from "@/lib/utils/pdfGenerator";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Helper function to create cache key from version ID
function createCacheKey(versionId: string): string {
  return `pdf:${versionId}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Rate limiting
    const rateLimit = await apiRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    // Parse request body
    const { resumeId } = await request.json();

    // Validate required fields
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 },
      );
    }

    // Get resume and check ownership
    const resumeResult = await db
      .select()
      .from(resume)
      .where(eq(resume.id, resumeId))
      .limit(1);

    if (resumeResult.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check authorization
    if (resumeResult[0].userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to resume" },
        { status: 403 },
      );
    }

    // Try to get the latest version, fall back to main resume
    const latestVersion = await db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, resumeId))
      .orderBy(desc(resumeVersions.version))
      .limit(1);

    let resumeData;
    let cacheVersionId;
    if (latestVersion.length === 0) {
      // No versions exist, use main resume
      resumeData = resumeResult[0];
      cacheVersionId = resumeId; // Use resume ID as fallback cache key
    } else {
      // Use latest version
      resumeData = latestVersion[0];
      cacheVersionId = latestVersion[0].id; // Use version ID as cache key
    }

    // Check cache first
    const cacheKey = createCacheKey(cacheVersionId);
    try {
      const cachedResult = await redis.hgetall(cacheKey);
      if (cachedResult && cachedResult.pdfBase64 && cachedResult.pageCount) {
        return NextResponse.json({
          pdfBase64: cachedResult.pdfBase64,
          pageCount: parseInt(cachedResult.pageCount as string),
          cached: true,
        });
      }
    } catch (error) {
      console.warn("Cache retrieval error:", error);
    }

    // Generate PDF
    const { pdfBuffer, pageCount } = await generatePDFServerSide(
      resumeData.markdown,
      resumeData.css,
    );

    // Convert to base64
    const pdfBase64 = pdfBuffer.toString("base64");

    // Cache the result for 24 hours
    try {
      await redis.hset(cacheKey, {
        pdfBase64,
        pageCount: pageCount.toString(),
      });
      await redis.expire(cacheKey, 86400); // 24 hours TTL
    } catch (error) {
      console.warn("Cache storage error:", error);
    }

    return NextResponse.json({
      pdfBase64,
      pageCount,
      cached: false,
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
