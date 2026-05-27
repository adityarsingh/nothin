import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { entries: { where: { deletedAt: null } } } }
      }
    });
    
    return NextResponse.json(journals);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const { name, description } = json;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Ensure User exists in DB (sync Clerk to Prisma)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || "unknown@example.com",
        name: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User",
      }
    });

    const journal = await prisma.journal.create({
      data: {
        userId,
        name,
        description: description || null,
      }
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
