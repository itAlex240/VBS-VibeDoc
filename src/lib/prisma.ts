import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  const rawPath = dbUrl.replace(/^file:/, "");
  const absolutePath = path.isAbsolute(rawPath)
    ? rawPath
    : path.join(process.cwd(), rawPath);

  // Ensure parent directory exists
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Auto-initialize tables if they do not exist
  try {
    const sqlite = new Database(absolutePath);
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "Document" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL DEFAULT 'Untitled Document',
          "markdownContent" TEXT NOT NULL DEFAULT '',
          "canvasState" TEXT NOT NULL DEFAULT '{}',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Settings" (
          "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
          "openAiKey" TEXT,
          "geminiKey" TEXT,
          "aiProvider" TEXT NOT NULL DEFAULT 'openai',
          "theme" TEXT NOT NULL DEFAULT 'system'
      );
    `);
    sqlite.close();
  } catch (err) {
    console.error("Error auto-initializing SQLite tables:", err);
  }

  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
