import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import { startOfDay, addDays, format, getDay } from "date-fns";

const moodScore = {
  VERY_LOW: 1,
  LOW: 2,
  NEUTRAL: 3,
  HIGH: 4,
  VERY_HIGH: 5
};

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const weekStartParam = searchParams.get("weekStart");
    if (!weekStartParam) return new NextResponse("weekStart is required", { status: 400 });

    const startDate = startOfDay(new Date(weekStartParam));
    const endDate = addDays(startDate, 7);

    // Fetch user settings to check if dismissed
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (settings?.dismissedWeeklyReviews?.includes(startDate.toISOString())) {
      return NextResponse.json({ dismissed: true });
    }

    const entries = await prisma.entry.findMany({
      where: {
        userId,
        deletedAt: null,
        entryDate: { gte: startDate, lt: endDate }
      },
      include: {
        tags: { include: { tag: true } }
      },
      orderBy: { entryDate: 'asc' }
    });

    if (entries.length === 0) {
      return NextResponse.json({ empty: true });
    }

    let totalWords = 0;
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const tagCounts: Record<string, number> = {};
    const trend: { day: string, date: string, score: number | null }[] = [];

    // Initialize trend array for 7 days
    for (let i = 0; i < 7; i++) {
      const d = addDays(startDate, i);
      trend.push({
        day: format(d, "EEE"),
        date: d.toISOString(),
        score: null
      });
    }

    entries.forEach(entry => {
      // Words
      if (entry.bodyText) {
        totalWords += entry.bodyText.trim().split(/\s+/).length;
      }
      
      // Days
      const dayIndex = getDay(new Date(entry.entryDate));
      dayCounts[dayIndex]++;

      // Mood
      if (entry.mood) {
        // Find which day of the week this entry falls on relative to startDate
        const diffTime = Math.abs(new Date(entry.entryDate).getTime() - startDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          trend[diffDays].score = moodScore[entry.mood];
        }
      }

      // Tags
      entry.tags.forEach(t => {
        tagCounts[t.tag.name] = (tagCounts[t.tag.name] || 0) + 1;
      });
    });

    // Most active day
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const mostActiveDay = daysOfWeek[maxDayIndex];

    // Most used tags (top 3)
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Generate dynamic prompts
    const prompts = [];
    const validScores = trend.map(t => t.score).filter((s): s is number => s !== null);
    
    if (validScores.length >= 2) {
      const firstHalf = validScores.slice(0, Math.floor(validScores.length / 2));
      const secondHalf = validScores.slice(Math.floor(validScores.length / 2));
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (avgSecond < avgFirst - 0.5) {
        prompts.push("What felt heavy this week?");
      } else if (avgSecond > avgFirst + 0.5) {
        prompts.push("What lifted your spirits?");
      } else {
        prompts.push("What brought you a sense of balance this week?");
      }
    } else {
      prompts.push("What was the defining moment of your week?");
    }

    if (topTags.length > 0 && topTags[0].count >= 3) {
      prompts.push(`You kept writing about ${topTags[0].name}. What does that mean to you?`);
    } else {
      prompts.push("What's one thing you want to focus on next week?");
    }
    
    prompts.push("What is one thing you learned about yourself recently?");

    return NextResponse.json({
      empty: false,
      totalEntries: entries.length,
      totalWords,
      mostActiveDay,
      trend,
      topTags,
      prompts
    });

  } catch (error) {
    console.error("[GET /api/reflections/weekly]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
