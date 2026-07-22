import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/documents - List all documents (or create default if empty)
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

    // If no documents exist, seed initial document
    if (documents.length === 0) {
      const defaultDoc = await prisma.document.create({
        data: {
          title: "Getting Started with VBS-VibeDoc",
          markdownContent: `# Welcome to VBS-VibeDoc 🚀

VBS-VibeDoc is a self-hosted documentation tool with built-in **AI VBScript auto-documentation** and an interactive **visual drawing canvas**.

---

### Features
1. **Markdown Editor**: Write clean documentation with syntax highlighting for VBScript.
2. **AI Magic Button**: Auto-analyze and document legacy VBScript code using OpenAI.
3. **Visual Canvas**: Draw flowcharts, diagrams, and drop screenshots with tldraw below.
4. **Presentation & Print**: Switch to presentation mode or export to clean PDF.

---

### Sample VBScript

\`\`\`vbscript
' VBScript Sample Script
Dim fso, logFile
Set fso = CreateObject("Scripting.FileSystemObject")
Set logFile = fso.CreateTextFile("C:\\Logs\\process.log", True)
logFile.WriteLine("VBScript Execution Started at " & Now())
logFile.Close()
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
