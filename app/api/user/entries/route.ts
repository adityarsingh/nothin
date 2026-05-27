import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Soft delete all entries
    await prisma.entry.updateMany({
      where: { userId },
      data: { deletedAt: new Date() }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/user/entries]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
