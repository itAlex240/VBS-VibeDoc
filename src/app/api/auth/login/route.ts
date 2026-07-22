import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD || "vibedoc2026";

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid Master Password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Set HTTP-only auth_token cookie valid for 30 days
    response.cookies.set({
      name: "auth_token",
      value: "vibedoc_authenticated_session",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
