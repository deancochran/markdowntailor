import { auth } from "@/auth";
import { apiRateLimiter } from "@/lib/upstash";
import {
  generatePDFDataURL,
  generatePDFServerSide,
} from "@/lib/utils/pdfGenerator";
import { NextRequest, NextResponse } from "next/server";

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
    const { markdown, css, options } = await request.json();

    // Validate required fields
    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 },
      );
    }

    // Generate PDF
    const { pdfBuffer, pageCount } = await generatePDFServerSide(
      markdown,
      css || "",
      {
        format: options?.format || "A4",
        margin: options?.margin || {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      },
    );

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
        "X-Page-Count": pageCount.toString(),
      },
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

// Alternative endpoint that returns base64 data URL (for preview)
export async function PUT(request: NextRequest) {
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
    const { markdown, css, options } = await request.json();

    // Validate required fields
    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 },
      );
    }

    // Generate PDF as data URL
    const result = await generatePDFDataURL(markdown, css || "", options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("PDF preview generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF preview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
