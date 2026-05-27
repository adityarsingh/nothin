import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    
    // In Next.js 15 App Router, `params` should be awaited.
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const journal = await prisma.journal.findUnique({
      where: { 
        id,
        userId // Ensure it belongs to the user
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
