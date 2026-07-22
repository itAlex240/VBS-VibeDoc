import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Fetch global settings
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          openAiKey: "",
          geminiKey: "",
          aiProvider: "openai",
          theme: "system",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST /api/settings - Update global settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { openAiKey, geminiKey, aiProvider, theme } = body;

    const updatedSettings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...(openAiKey !== undefined && { openAiKey }),
        ...(geminiKey !== undefined && { geminiKey }),
        ...(aiProvider !== undefined && { aiProvider }),
        ...(theme !== undefined && { theme }),
      },
      create: {
        id: 1,
        openAiKey: openAiKey || "",
        geminiKey: geminiKey || "",
        aiProvider: aiProvider || "openai",
        theme: theme || "system",
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
