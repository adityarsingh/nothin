import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { startOfMonth, endOfMonth, parse } from "date-fns";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    
    if (!month || !year) return new NextResponse("month and year required", { status: 400 });

    const startDate = startOfMonth(parse(`${year}-${month}-01`, "yyyy-MM-dd", new Date()));
    const endDate = endOfMonth(startDate);

    const entries = await prisma.entry.findMany({
      where: {
        userId,
        deletedAt: null,
        entryDate: { gte: startDate, lte: endDate }
      },
      include: {
        tags: { include: { tag: true } },
        people: { include: { person: true } }
      },
      orderBy: { entryDate: 'asc' }
    });

    if (entries.length === 0) {
      return NextResponse.json({ empty: true });
    }

    let totalWords = 0;
    const activeDays = new Set<string>();
    const moodCounts: Record<string, number> = {
      VERY_LOW: 0, LOW: 0, NEUTRAL: 0, HIGH: 0, VERY_HIGH: 0
    };
    const tagCounts: Record<string, number> = {};
    const personCounts: Record<string, number> = {};
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: Date | null = null;

    entries.forEach(entry => {
      // Words
      if (entry.bodyText) {
        totalWords += entry.bodyText.trim().split(/\s+/).length;
      }
      
      // Unique Days & Streaks
      const dayStr = entry.entryDate.toISOString().split('T')[0];
      activeDays.add(dayStr);
      
      const entryDate = new Date(dayStr);
      if (lastDate) {
        const diffDays = Math.round((entryDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1 || diffDays === 0) {
          if (diffDays === 1) currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      lastDate = entryDate;

      // Moods
      if (entry.mood) {
        moodCounts[entry.mood]++;
      }

      // Tags
      entry.tags.forEach(t => {
        tagCounts[t.tag.name] = (tagCounts[t.tag.name] || 0) + 1;
      });

      // People
      entry.people.forEach(p => {
        personCounts[p.person.name] = (personCounts[p.person.name] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, value: count }));

    const topPerson = Object.entries(personCounts).sort((a, b) => b[1] - a[1])[0];

    // Mood distribution for Donut Chart
    const moodDistribution = Object.entries(moodCounts)
      .filter(([_, count]) => count > 0)
      .map(([mood, count]) => ({ name: mood, value: count }));

    // Auto-suggested meaningful entries (longest + most tags)
    const suggestedEntries = [...entries]
      .sort((a, b) => {
        const scoreA = (a.bodyText?.length || 0) + (a.tags.length * 100);
        const scoreB = (b.bodyText?.length || 0) + (b.tags.length * 100);
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map(e => ({
        id: e.id,
        title: e.title || "Untitled",
        date: e.entryDate,
        snippet: e.bodyText?.substring(0, 100) + "..."
      }));

    return NextResponse.json({
      empty: false,
      totalEntries: entries.length,
      totalWords,
      journalingDays: activeDays.size,
      longestStreak,
      moodDistribution,
      topTags,
      topPerson: topPerson ? topPerson[0] : null,
      suggestedEntries
    });

  } catch (error) {
    console.error("[GET /api/reflections/monthly]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
