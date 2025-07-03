import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "PDF generation has been moved to client-side" },
    { status: 501 },
  );
}
