import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma"; // using relative import because alias was not verified

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, journalName, reminderEnabled, reminderTime } = body;

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || `${userId}@example.com`;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      return NextResponse.json({ success: true, message: "User already exists" });
    }

    // Create user in DB
    const dbUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name: name || user?.firstName || "Journaler",
        settings: {
          create: {
            theme: "SYSTEM",
            reminderEnabled: !!reminderEnabled,
            reminderTime: reminderTime || null,
          }
        }
      }
    });

    // Create default journal
    const journal = await prisma.journal.create({
      data: {
        userId: userId,
        name: journalName || "Personal",
        description: "My primary journal.",
        color: "#01696F",
        icon: "📓",
      }
    });

    // Update default journal setting
    await prisma.userSettings.update({
      where: { userId },
      data: { defaultJournalId: journal.id }
    });

    return NextResponse.json({ success: true, user: dbUser, journal });
  } catch (error) {
    console.error("[USER_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
