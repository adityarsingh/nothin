import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import EntryEditor from "../../../components/editor/EntryEditor";
import { Database } from "lucide-react";

export default async function NewEntryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  try {
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
  } catch (error) {
    console.error("Database connection error in NewEntryPage:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-6">
        <Database className="w-12 h-12 text-muted mb-4" />
        <h1 className="font-display text-3xl mb-2">We couldn't connect to your database</h1>
        <p className="text-muted text-center max-w-md mb-6">
          The application is having trouble reaching the production database server. This is usually caused by incorrect database environment variables or a temporary pooler outage.
        </p>
        <div className="bg-surface border border-border p-4 rounded-md text-sm text-muted w-full max-w-md">
          <p className="font-semibold text-text mb-2">How to fix this on Vercel:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ensure <code className="bg-background px-1 py-0.5 rounded">DATABASE_URL</code> is set to the Supabase Transaction pooler (port 6543)</li>
            <li>Ensure <code className="bg-background px-1 py-0.5 rounded">DATABASE_URL</code> ends with <code className="bg-background px-1 py-0.5 rounded">?pgbouncer=true</code></li>
          </ul>
        </div>
      </div>
    );
  }
}
