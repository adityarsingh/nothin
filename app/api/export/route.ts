import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import AdmZip from "adm-zip";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { format: exportFormat = "markdown", journalId } = body;

    const whereClause: any = { userId, deletedAt: null };
    if (journalId) whereClause.journalId = journalId;

    const entries = await prisma.entry.findMany({
      where: whereClause,
      include: {
        journal: true,
        tags: { include: { tag: true } }
      },
      orderBy: { entryDate: 'desc' }
    });

    // We can also generate a single JSON file instead of ZIP if requested
    if (exportFormat === "json") {
      const jsonStr = JSON.stringify(entries, null, 2);
      return new NextResponse(jsonStr, {
        headers: {
          "Content-Disposition": `attachment; filename="nothin_export_${format(new Date(), 'yyyy-MM-dd')}.json"`,
          "Content-Type": "application/json"
        }
      });
    }

    // Markdown ZIP export
    const zip = new AdmZip();

    entries.forEach(entry => {
      const dateStr = format(new Date(entry.entryDate), "yyyy-MM-dd_HH-mm");
      const titleSlug = entry.title ? entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'untitled';
      const filename = `${dateStr}_${titleSlug}.md`;
      
      const tagStr = entry.tags.length > 0 
        ? `\nTags: ${entry.tags.map(t => t.tag.name).join(", ")}` 
        : "";
        
      const content = `---
Title: ${entry.title || "Untitled"}
Date: ${format(new Date(entry.entryDate), "yyyy-MM-dd HH:mm:ss")}
Journal: ${entry.journal.name}
Mood: ${entry.mood || "None"}${tagStr}
---

${entry.bodyText || ""}
`;
      // Use the journal name as a folder inside the ZIP
      const folderName = entry.journal.name.replace(/[^a-z0-9\s]/gi, '').trim() || "Uncategorized";
      zip.addFile(`${folderName}/${filename}`, Buffer.from(content, "utf8"));
    });

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="nothin_export_${format(new Date(), 'yyyy-MM-dd')}.zip"`,
        "Content-Type": "application/zip",
        "Content-Length": zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error("[POST /api/export]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
