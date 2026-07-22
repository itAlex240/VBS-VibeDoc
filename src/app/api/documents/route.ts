import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/documents - List all documents (or create default VBS starter if empty)
export async function GET() {
  try {
    let documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // If no documents exist, seed initial Virtual Battlespace document
    if (documents.length === 0) {
      const defaultDoc = await prisma.document.create({
        data: {
          title: "VBS Tactical Behavior Tree & Scripting Guide",
          markdownContent: `# Welcome to VBS-VibeDoc 🪖

VBS-VibeDoc is a self-hosted documentation web app designed for **Virtual Battlespace (VBS by Bohemia Interactive Simulations)** thesis research, **Behavior Trees (BT)**, and **Lua / SQF scripting**.

---

### Features
1. **Markdown & Code Workspace**: Side-by-side editing with Lua & SQF syntax highlighting.
2. **AI VBS Auto-Documenter**: Auto-generate structured documentation for Behavior Tree tasks and tactical AI scripts using OpenAI or Google Gemini.
3. **Visual tldraw Canvas**: Draw tactical flowcharts, BT node trees, and attach mission screenshots.
4. **Local Image Uploads**: Automatic image asset handling without database bloat.

---

### Sample VBS Behavior Tree Task (Lua)

\`\`\`lua
-- Virtual Battlespace (VBS) AI Tactical Patrol Task
local PatrolTask = {}

function PatrolTask:OnStart(unit, waypoint)
    if not unit:IsAlive() then return "FAILURE" end
    unit:MoveTo(waypoint:GetPosition())
    unit:SetSpeedMode("LIMITED")
    unit:SetFormation("COLUMN")
    return "RUNNING"
end

function PatrolTask:OnUpdate(unit, waypoint)
    if unit:HasReached(waypoint) then
        return "SUCCESS"
    elseif unit:IsUnderFire() then
        unit:SetBehavior("COMBAT")
        return "FAILURE"
    end
    return "RUNNING"
end

return PatrolTask
\`\`\`
`,
          canvasState: "{}",
        },
      });

      documents = [
        {
          id: defaultDoc.id,
          title: defaultDoc.title,
          updatedAt: defaultDoc.updatedAt,
        },
      ];
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// POST /api/documents - Create a new document
export async function POST() {
  try {
    const newDoc = await prisma.document.create({
      data: {
        title: "Untitled Document",
        markdownContent: "",
        canvasState: "{}",
      },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
