import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { resume } from "@/db/schema";
import { apiRateLimiter } from "@/lib/upstash";
import { NextResponse } from "next/server";
import { z } from "zod";

const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  markdown: z.string().optional(),
  css: z.string().optional(),
  // You can add more fields here as needed
});

export async function POST(request: Request) {
  try {
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

    // 3. Validate Request Body
    const body = await request.json();
    const parsed = createResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { title, markdown, css } = parsed.data;

    // 4. Insert into Database
    const [newResume] = await db
      .insert(resume)
      .values({
        userId,
        title,
        markdown,
        css,
        // Set other fields to default or provided values
      })
      .returning();

    return NextResponse.json(newResume, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Failed to create resume:", error);
    return NextResponse.json(
      {
        error: "Failed to create resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
