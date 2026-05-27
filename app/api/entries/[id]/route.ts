import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { entrySchema } from "../../../../lib/validations";
import { extractPlainText } from "../../../../lib/tiptap";

// Note: In Next.js 15, `params` is a Promise in Route Handlers
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const entry = await prisma.entry.findUnique({
      where: { id, userId, deletedAt: null },
      include: {
        tags: { include: { tag: true } },
        people: { include: { person: true } },
        journal: { select: { name: true } },
      }
    });

    if (!entry) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Locked entry check for V1
    if (entry.isLocked) {
      const url = new URL(req.url);
      const unlockCode = url.searchParams.get("unlockCode");
      if (!unlockCode) {
        return NextResponse.json({ error: "Locked", isLocked: true }, { status: 403 });
      }
      // For V1, any non-empty unlock code bypasses (as per front-end UX only requirement)
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("[GET /api/entries/[id]]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    
    // Verify ownership
    const existing = await prisma.entry.findUnique({
      where: { id, userId, deletedAt: null },
      include: { tags: { include: { tag: true } } }
    });

    if (!existing) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const json = await req.json();
    const parsed = entrySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const { title, body, mood, tags, people, place, journalId, entryDate, isLocked, isPinned } = parsed.data;
    const bodyText = body ? extractPlainText(body).trim() : "";

    // Tag management: naive approach for V1 (delete connections, recreate, update counts)
    const oldTagNames = existing.tags.map(t => t.tag.name);
    const newTagNames = tags.map(t => t.toLowerCase().trim());
    
    const tagsToRemove = oldTagNames.filter(t => !newTagNames.includes(t));
    const tagsToAdd = newTagNames.filter(t => !oldTagNames.includes(t));

    // Decrement removed tags
    if (tagsToRemove.length > 0) {
      await prisma.tag.updateMany({
        where: { userId, name: { in: tagsToRemove } },
        data: { entryCount: { decrement: 1 } }
      });
    }

    // Upsert and increment new tags
    const newTagIds = await Promise.all(
      tagsToAdd.map(async (name) => {
        let tag = await prisma.tag.findUnique({ where: { userId_name: { userId, name } } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { userId, name, entryCount: 1 } });
        } else {
          tag = await prisma.tag.update({ where: { id: tag.id }, data: { entryCount: { increment: 1 } } });
        }
        return tag.id;
      })
    );

    // Keep existing tag IDs that weren't removed
    const keptTagIds = existing.tags
      .filter(t => !tagsToRemove.includes(t.tag.name))
      .map(t => t.tagId);

    const allFinalTagIds = [...keptTagIds, ...newTagIds];

    // Delete existing links
    await prisma.entryTag.deleteMany({ where: { entryId: id } });

    // Update Entry
    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        title,
        body,
        bodyText,
        mood,
        place,
        journalId,
        entryDate: new Date(entryDate),
        isLocked,
        isPinned,
        tags: {
          create: allFinalTagIds.map(tagId => ({ tagId }))
        }
        // People mapping omitted for brevity as UI doesn't use it yet, 
        // but could follow the same pattern.
      },
      include: {
        tags: { include: { tag: true } },
        journal: { select: { name: true } }
      }
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("[PATCH /api/entries/[id]]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.entry.findUnique({
      where: { id, userId, deletedAt: null }
    });

    if (!existing) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Soft delete
    await prisma.entry.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/entries/[id]]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
