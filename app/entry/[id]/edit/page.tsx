import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import EntryEditor from "../../../../components/editor/EntryEditor";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  const entry = await prisma.entry.findUnique({
    where: { id, userId }
  });

  const journals = await prisma.journal.findMany({
    where: { userId },
    select: { id: true, name: true }
  });

  return (
    <EntryEditor 
      initialId={id}
      journals={journals} 
      defaultJournalId={entry?.journalId || undefined} 
    />
  );
}
