import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import EntryEditor from "../../../components/editor/EntryEditor";

export default async function NewEntryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const journals = await prisma.journal.findMany({
    where: { userId },
    select: { id: true, name: true }
  });

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId }
  });

  return (
    <EntryEditor 
      journals={journals} 
      defaultJournalId={userSettings?.defaultJournalId || undefined} 
    />
  );
}
