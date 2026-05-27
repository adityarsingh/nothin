import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { endOfMonth, startOfMonth } from "date-fns";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");
    const journalId = searchParams.get("journalId");

    if (!monthStr || !yearStr) {
      return new NextResponse("Missing month or year", { status: 400 });
    }

    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-indexed for JS Date
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));

    const whereClause: any = {
      userId,
      deletedAt: null,
      entryDate: {
        gte: startDate,
        lte: endDate,
      }
    };

    if (journalId) {
      whereClause.journalId = journalId;
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      select: {
        entryDate: true,
        mood: true,
      }
    });

    const aggregated = entries.reduce((acc: any, entry) => {
      const dateStr = entry.entryDate.toISOString().split("T")[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, count: 0, moods: [] };
      }
      acc[dateStr].count += 1;
      if (entry.mood && !acc[dateStr].moods.includes(entry.mood)) {
        acc[dateStr].moods.push(entry.mood);
      }
      return acc;
    }, {});

    return NextResponse.json(Object.values(aggregated));
  } catch (error) {
    console.error("[GET /api/entries/calendar]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
