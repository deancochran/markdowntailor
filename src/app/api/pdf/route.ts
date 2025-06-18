import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { resume } from "@/db/schema";
import { apiRateLimiter, redis } from "@/lib/upstash";
import { generatePDFServerSide } from "@/lib/utils/pdfGenerator";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Helper function to create cache key from version ID
function generateCacheKey(markdown: string, css: string): string {
  const content = markdown + css;
  return crypto.createHash("sha256").update(content).digest("hex");
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
    const [resumeData] = await db
      .select()
      .from(resume)
      .where(eq(resume.id, resumeId));

    if (!resumeData) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check authorization
    if (resumeData.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to resume" },
        { status: 403 },
      );
    }

    // Check cache first
    const cacheKey = generateCacheKey(resumeData.markdown, resumeData.css);
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
