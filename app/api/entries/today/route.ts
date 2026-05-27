import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { startOfDay, endOfDay, subYears } from "date-fns";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get("journalId");
    
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const baseWhere: any = { userId, deletedAt: null };
    if (journalId) baseWhere.journalId = journalId;

    // 1. Today's entries
    const todayEntries = await prisma.entry.findMany({
      where: {
        ...baseWhere,
        entryDate: {
          gte: todayStart,
          lte: todayEnd,
        }
      },
      include: { tags: { include: { tag: true } }, journal: { select: { name: true } } },
      orderBy: { entryDate: "desc" }
    });

    // 2. Recent entries (last 5, excluding today)
    const recentEntries = await prisma.entry.findMany({
      where: {
        ...baseWhere,
        entryDate: { lt: todayStart }
      },
      include: { tags: { include: { tag: true } }, journal: { select: { name: true } } },
      orderBy: { entryDate: "desc" },
      take: 5
    });

    // 3. On this day (same date, previous years)
    // For V1, checking last 5 years
    const onThisDayQueries = [1, 2, 3, 4, 5].map(years => {
      const pastDateStart = startOfDay(subYears(now, years));
      const pastDateEnd = endOfDay(subYears(now, years));
      return prisma.entry.findMany({
        where: {
          ...baseWhere,
          entryDate: { gte: pastDateStart, lte: pastDateEnd }
        },
        include: { tags: { include: { tag: true } }, journal: { select: { name: true } } }
      });
    });
    
    const onThisDayResults = await Promise.all(onThisDayQueries);
    const onThisDay = onThisDayResults.flat().sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime());

    return NextResponse.json({
      today: todayEntries,
      recent: recentEntries,
      onThisDay
    });
  } catch (error) {
    console.error("[GET /api/entries/today]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
