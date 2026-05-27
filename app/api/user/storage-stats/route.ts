import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const stats = await prisma.entry.aggregate({
      where: { userId, deletedAt: null },
      _count: { id: true }
    });

    // To estimate storage, we sum the length of bodyText across all entries
    // Prisma aggregate doesn't support sum on string length directly in one go easily without raw SQL
    const rawResult: any = await prisma.$queryRaw`
      SELECT sum(length("bodyText")) as "totalBytes"
      FROM "Entry"
      WHERE "userId" = ${userId} AND "deletedAt" IS NULL
    `;

    const totalBytes = Number(rawResult[0]?.totalBytes || 0);

    return NextResponse.json({
      totalEntries: stats._count.id,
      totalBytes,
      limitBytes: 50 * 1024 * 1024 // 50MB free tier cap
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
