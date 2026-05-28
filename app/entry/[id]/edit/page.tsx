import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import EntryEditor from "../../../../components/editor/EntryEditor";
import { FileX2 } from "lucide-react";
import Link from "next/link";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  const [entry, journals] = await Promise.all([
    prisma.entry.findUnique({
      where: { id, userId, deletedAt: null },
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.journal.findMany({
      where: { userId },
      select: { id: true, name: true },
    }),
  ]);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-6">
        <FileX2 className="w-12 h-12 text-muted mb-4" />
        <h1 className="font-display text-3xl mb-2">Entry not found</h1>
        <p className="text-muted text-center max-w-md mb-6">
          This entry doesn&apos;t exist or you don&apos;t have permission to edit it.
        </p>
        <Link href="/today" className="text-primary font-medium border-b border-primary/30 hover:border-primary pb-0.5">
          Go back to Today
        </Link>
      </div>
    );
  }

  return (
    <EntryEditor
      initialId={id}
      journals={journals}
      initialData={{
        title: entry.title ?? "",
        body: entry.body ?? null,
        bodyText: entry.bodyText ?? "",
        mood: entry.mood ?? null,
        tags: entry.tags.map((t) => t.tag.name),
        journalId: entry.journalId,
        entryDate: entry.entryDate.toISOString(),
        isLocked: entry.isLocked,
      }}
    />
  );
}
