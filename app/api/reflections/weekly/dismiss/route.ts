import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { weekStart } = await req.json();
    if (!weekStart) return new NextResponse("weekStart is required", { status: 400 });

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) return new NextResponse("Settings not found", { status: 404 });

    const currentDismissed = settings.dismissedWeeklyReviews || [];
    if (!currentDismissed.includes(weekStart)) {
      await prisma.userSettings.update({
        where: { userId },
        data: {
          dismissedWeeklyReviews: [...currentDismissed, weekStart]
        }
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[POST /api/reflections/weekly/dismiss]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
