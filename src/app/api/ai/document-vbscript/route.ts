import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vbscriptCode } = body;

    if (!vbscriptCode || typeof vbscriptCode !== "string" || !vbscriptCode.trim()) {
      return NextResponse.json(
        { error: "VBScript code is required" },
        { status: 400 }
      );
    }

    // 1. Get Settings from DB
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    const aiProvider = settings?.aiProvider || "openai";
    const systemPrompt =
      "Analyze this VBScript. Write a concise, professional Markdown documentation covering: 1. Purpose, 2. Input Parameters, 3. Dependencies/Objects used (e.g., FileSystemObject). 4. Step-by-step logic.";

    // 2. Handle Google Gemini API
    if (aiProvider === "gemini") {
      const geminiKey = settings?.geminiKey || process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return NextResponse.json(
          {
            error:
              "Google Gemini API Key is missing. Please configure your key in Settings (⚙️).",
          },
          { status: 400 }
        );
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nHere is the raw VBScript code to analyze:\n\`\`\`vbscript\n${vbscriptCode}\n\`\`\``,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Gemini API returned status ${res.status}`
        );
      }

      const data = await res.json();
      const documentation =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Failed to generate documentation using Gemini.";

      return NextResponse.json({ documentation });
    }

    // 3. Handle OpenAI API
    const openAiKey = settings?.openAiKey || process.env.OPENAI_API_KEY;

    if (!openAiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API Key is missing. Please configure your key in Settings (⚙️).",
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the raw VBScript code to document:\n\n\`\`\`vbscript\n${vbscriptCode}\n\`\`\``,
        },
      ],
      temperature: 0.3,
    });

    const documentation =
      response.choices[0]?.message?.content ||
      "Failed to generate documentation using OpenAI.";

    return NextResponse.json({ documentation });
  } catch (error: any) {
    console.error("Error in AI VBScript Auto-Documenter:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An error occurred while generating VBScript documentation.",
      },
      { status: 500 }
    );
  }
}
