import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { subYears, startOfDay, endOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const today = new Date();
    
    // 1. Check for entries from 1 year ago and 2 years ago today
    const oneYearAgoStart = startOfDay(subYears(today, 1));
    const oneYearAgoEnd = endOfDay(subYears(today, 1));
    
    const twoYearsAgoStart = startOfDay(subYears(today, 2));
    const twoYearsAgoEnd = endOfDay(subYears(today, 2));

    const pastEntries = await prisma.entry.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { entryDate: { gte: oneYearAgoStart, lte: oneYearAgoEnd } },
          { entryDate: { gte: twoYearsAgoStart, lte: twoYearsAgoEnd } }
        ]
      },
      select: {
        id: true,
        title: true,
        entryDate: true,
        bodyText: true
      },
      orderBy: { entryDate: 'desc' }
    });

    // 2. Check for tags used 5+ times in the last 30 days
    const thirtyDaysAgo = subDays(today, 30);
    
    const recentEntries = await prisma.entry.findMany({
      where: {
        userId,
        deletedAt: null,
        entryDate: { gte: thirtyDaysAgo }
      },
      select: { tags: { include: { tag: true } } }
    });

    const tagCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      entry.tags.forEach(t => {
        tagCounts[t.tag.name] = (tagCounts[t.tag.name] || 0) + 1;
      });
    });

    const frequentTags = Object.entries(tagCounts)
      .filter(([_, count]) => count >= 5)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Format response
    const memories = [];
    
    if (pastEntries.length > 0) {
      // Pick one randomly or just the first
      const entry = pastEntries[0];
      const yearsAgo = today.getFullYear() - new Date(entry.entryDate).getFullYear();
      memories.push({
        type: 'on-this-day',
        title: `On this day, ${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`,
        entry: {
          id: entry.id,
          title: entry.title || "Untitled",
          snippet: entry.bodyText?.substring(0, 100) + "..."
        }
      });
    }

    if (frequentTags.length > 0) {
      memories.push({
        type: 'frequent-tag',
        title: `You kept writing about ${frequentTags[0].name}`,
        description: `This tag appeared ${frequentTags[0].count} times in the last 30 days.`,
        tag: frequentTags[0].name
      });
    }

    return NextResponse.json({ memories });

  } catch (error) {
    console.error("[GET /api/reflections/memory-resurface]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
