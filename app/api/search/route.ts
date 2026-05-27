import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const journalId = searchParams.get("journalId");
    const mood = searchParams.get("mood");
    const tags = searchParams.get("tags");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const sort = searchParams.get("sort") || "newest";
    const pinnedOnly = searchParams.get("pinnedOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const conditions: Prisma.Sql[] = [Prisma.sql`e."userId" = ${userId}`];
    conditions.push(Prisma.sql`e."deletedAt" IS NULL`);

    if (q.trim()) {
      conditions.push(Prisma.sql`to_tsvector('english', coalesce(e."title", '') || ' ' || coalesce(e."bodyText", '')) @@ websearch_to_tsquery('english', ${q})`);
    }

    if (journalId) {
      const jIds = journalId.split(",").filter(Boolean);
      if (jIds.length > 0) {
        conditions.push(Prisma.sql`e."journalId" IN (${Prisma.join(jIds)})`);
      }
    }

    if (mood) {
      const moods = mood.split(",").filter(Boolean);
      if (moods.length > 0) {
        conditions.push(Prisma.sql`e."mood"::text IN (${Prisma.join(moods)})`);
      }
    }

    if (from) {
      conditions.push(Prisma.sql`e."entryDate" >= ${new Date(from)}`);
    }

    if (to) {
      conditions.push(Prisma.sql`e."entryDate" <= ${new Date(to)}`);
    }

    if (pinnedOnly) {
      conditions.push(Prisma.sql`e."isPinned" = true`);
    }
    
    if (tags) {
      const tagList = tags.split(",").map(t => t.toLowerCase().trim()).filter(Boolean);
      if (tagList.length > 0) {
        conditions.push(Prisma.sql`
          EXISTS (
            SELECT 1 FROM "EntryTag" et
            JOIN "Tag" t ON t.id = et."tagId"
            WHERE et."entryId" = e.id AND t.name IN (${Prisma.join(tagList)})
          )
        `);
      }
    }

    const whereClause = Prisma.sql`${Prisma.join(conditions, " AND ")}`;

    let orderClause = Prisma.sql`ORDER BY e."entryDate" DESC`;
    if (sort === "oldest") {
      orderClause = Prisma.sql`ORDER BY e."entryDate" ASC`;
    } else if (sort === "recently_edited") {
      orderClause = Prisma.sql`ORDER BY e."updatedAt" DESC`;
    } else if (sort === "most_words") {
      orderClause = Prisma.sql`ORDER BY length(coalesce(e."bodyText", '')) DESC`;
    }

    const query = Prisma.sql`
      SELECT 
        e.id, 
        e.title, 
        e."entryDate", 
        e.mood, 
        e."journalId",
        j.name as "journalName",
        ${q.trim() 
          ? Prisma.sql`ts_headline('english', coalesce(e.title, '') || ' ' || coalesce(e."bodyText", ''), websearch_to_tsquery('english', ${q}), 'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15') AS snippet` 
          : Prisma.sql`substring(coalesce(e."bodyText", '') from 1 for 150) AS snippet`},
        coalesce((
          SELECT json_agg(json_build_object('name', t.name))
          FROM "EntryTag" et
          JOIN "Tag" t ON t.id = et."tagId"
          WHERE et."entryId" = e.id
        ), '[]'::json) as tags
      FROM "Entry" e
      JOIN "Journal" j ON j.id = e."journalId"
      WHERE ${whereClause}
      ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const results: any[] = await prisma.$queryRaw(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[GET /api/search]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
