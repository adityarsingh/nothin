import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import { entrySchema } from "../../../lib/validations";
import { extractPlainText } from "../../../lib/tiptap";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const parsed = entrySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const { title, body, mood, tags, people, place, journalId, entryDate, isLocked, isPinned } = parsed.data;
    
    // Extract plain text for search index
    const bodyText = body ? extractPlainText(body).trim() : "";

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

    // Handle Tags (Upsert)
    const tagConnections = await Promise.all(
      tags.map(async (tagName) => {
        const name = tagName.toLowerCase().trim();
        let tag = await prisma.tag.findUnique({
          where: { userId_name: { userId, name } }
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { userId, name, entryCount: 1 }
          });
        } else {
          tag = await prisma.tag.update({
            where: { id: tag.id },
            data: { entryCount: { increment: 1 } }
          });
        }
        return tag.id;
      })
    );

    // Handle People (Upsert)
    const personConnections = await Promise.all(
      people.map(async (personName) => {
        const name = personName.trim();
        let person = await prisma.person.findUnique({
          where: { userId_name: { userId, name } }
        });
        if (!person) {
          person = await prisma.person.create({
            data: { userId, name }
          });
        }
        return person.id;
      })
    );

    // Create Entry
    const entry = await prisma.entry.create({
      data: {
        userId,
        journalId,
        title,
        body,
        bodyText,
        mood,
        place,
        isLocked,
        isPinned,
        entryDate: new Date(entryDate),
        tags: {
          create: tagConnections.map(tagId => ({ tagId }))
        },
        people: {
          create: personConnections.map(personId => ({ personId }))
        }
      },
      include: {
        tags: { include: { tag: true } },
        people: { include: { person: true } },
        journal: { select: { name: true } }
      }
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[POST /api/entries]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get("journalId");
    const dateFilter = searchParams.get("date"); // YYYY-MM-DD
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const groupBy = searchParams.get("groupBy"); // day, week, month

    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId,
      deletedAt: null
    };

    if (journalId) {
      whereClause.journalId = journalId;
    }
    
    if (dateFilter) {
      // Create a date range for the specific day
      const startOfDay = new Date(`${dateFilter}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateFilter}T23:59:59.999Z`);
      whereClause.entryDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const entries = await prisma.entry.findMany({
      where: whereClause,
      include: {
        tags: { include: { tag: true } },
        journal: { select: { name: true } }
      },
      orderBy: { entryDate: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("[GET /api/entries]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
