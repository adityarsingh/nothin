"use client";

import { useEffect, useState, use } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import EntryCard from "../../../../components/shared/EntryCard";
import { TimelineSkeleton } from "../../../../components/shared/SkeletonLoader";
import { Search, RefreshCw, ArrowLeft, Book } from "lucide-react";

type GroupBy = "day" | "week" | "month";

export default function JournalTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [journal, setJournal] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [journalLoading, setJournalLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch Journal Details
  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await fetch(`/api/journals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJournal(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setJournalLoading(false);
      }
    };
    fetchJournal();
  }, [id]);

  const fetchEntries = async (pageNum: number, isNewGroup: boolean = false) => {
    try {
      const res = await fetch(`/api/entries?journalId=${id}&page=${pageNum}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (data.length < 20) setHasMore(false);
        
        if (isNewGroup) {
          setEntries(data);
        } else {
          setEntries(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchEntries(1, true);
  }, [id]); 

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntries(nextPage);
  };

  const groupedEntries = entries.reduce((acc: any, entry: any) => {
    const date = parseISO(entry.entryDate);
    let key = "";
    
    if (groupBy === "day") {
      key = format(date, "MMMM do, yyyy");
    } else if (groupBy === "week") {
      key = `Week of ${format(date, "MMM do, yyyy")}`;
    } else {
      key = format(date, "MMMM yyyy");
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  if (journalLoading) {
    return (
      <div className="flex w-full h-full min-h-screen p-6 md:p-12">
        <TimelineSkeleton />
      </div>
    );
  }

  if (!journal && !journalLoading) {
    return (
      <div className="flex w-full h-full min-h-screen p-6 md:p-12 items-center justify-center flex-col">
        <Book className="w-12 h-12 text-muted mb-4" />
        <h2 className="font-display text-2xl mb-2">Journal not found</h2>
        <Link href="/journals" className="text-primary hover:underline">Go back to Journals</Link>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full min-h-screen">
      <div className="flex-1 p-6 md:p-12 max-w-4xl border-r border-border">
        
        <header className="mb-12">
          <Link href="/journals" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Journals
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-display text-4xl text-text mb-2">{journal.name}</h1>
              {journal.description && <p className="text-muted">{journal.description}</p>}
            </div>
            <div className="flex items-center gap-4 text-text">
              <RefreshCw className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => fetchEntries(1, true)} />
            </div>
          </div>
        </header>

        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-2">
          <button className="px-5 py-1.5 bg-[#111111] dark:bg-white text-white dark:text-black rounded-full text-xs font-medium whitespace-nowrap">All Entries</button>
          
          <div className="w-px h-4 bg-border mx-2"></div>
          
          {(["day", "week", "month"] as GroupBy[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-5 py-1.5 text-xs font-medium rounded-full capitalize transition-colors whitespace-nowrap border ${
                groupBy === g ? "bg-[#EFEFEF] dark:bg-surface border-border text-text" : "bg-transparent border-transparent text-muted hover:text-text"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {loading && entries.length === 0 ? (
          <TimelineSkeleton />
        ) : entries.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-sm">
            <p className="text-muted mb-4">No entries in this journal yet.</p>
            <Link href="/entry/new" className="text-primary font-medium border-b border-primary/30 hover:border-primary pb-0.5">Write an entry</Link>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedEntries).map(([groupDate, groupEntries]: [string, any]) => (
              <section key={groupDate}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-display text-2xl text-text whitespace-nowrap">{groupDate}</h2>
                  <div className="w-full h-px bg-border"></div>
                </div>
                
                <div className="space-y-6">
                  {groupEntries.map((entry: any) => (
                    <EntryCard 
                      key={entry.id}
                      id={entry.id}
                      title={entry.title}
                      bodyText={entry.bodyText}
                      entryDate={entry.entryDate}
                      mood={entry.mood}
                      journalName={entry.journal?.name || journal.name}
                      tags={entry.tags.map((t: any) => t.tag.name)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full py-4 text-center text-sm font-medium text-muted hover:text-text border border-dashed border-border rounded-sm transition-colors hover:bg-surface"
              >
                Load older entries
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 p-8 shrink-0 bg-surface/30">
        <div className="mb-8">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted mb-4">Journal Details</h4>
          <div className="space-y-4 text-sm text-text">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted">Created</span>
              <span className="font-medium">{format(new Date(journal.createdAt), "MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted">Total Entries</span>
              <span className="font-medium">{journal._count?.entries || 0}</span>
            </div>
          </div>
        </div>
        
        <Link href="/entry/new" className="flex items-center justify-center gap-2 w-full bg-background border border-border text-text py-3 rounded text-sm font-medium hover:border-primary transition-colors">
          <span className="text-lg leading-none">+</span> Write in this Journal
        </Link>
      </div>
    </div>
  );
}
