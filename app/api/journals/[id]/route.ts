import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const journal = await prisma.journal.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        _count: { select: { entries: { where: { deletedAt: null } } } }
      }
    });

    if (!journal) {
      return new NextResponse("Journal not found", { status: 404 });
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const existing = await prisma.journal.findUnique({ where: { id, userId } });
    if (!existing) return new NextResponse("Not Found", { status: 404 });

    const { name, description } = await req.json();
    if (!name?.trim()) return new NextResponse("Name is required", { status: 400 });

    const updated = await prisma.journal.update({
      where: { id },
      data: { name: name.trim(), description: description ?? existing.description },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/journals/[id]]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.journal.findUnique({ where: { id, userId } });
    if (!existing) return new NextResponse("Not Found", { status: 404 });

    // Soft-delete all entries in this journal so they respect the deletedAt pattern
    await prisma.entry.updateMany({
      where: { journalId: id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    // Hard-delete the journal (no deletedAt field on Journal model)
    await prisma.journal.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/journals/[id]]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
