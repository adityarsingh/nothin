"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import EntryCard from "../../../components/shared/EntryCard";
import { TimelineSkeleton } from "../../../components/shared/SkeletonLoader";
import { Search, RefreshCw, Lock } from "lucide-react";

type GroupBy = "day" | "week" | "month";

export default function TimelinePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleEntryDeleted = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };
  
  const fetchEntries = async (pageNum: number, isNewGroup: boolean = false) => {
    try {
      const res = await fetch(`/api/entries?page=${pageNum}&limit=20`);
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
  }, []); 

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

  return (
    <div className="flex w-full h-full min-h-screen">
      <div className="flex-1 p-6 md:p-12 max-w-4xl border-r border-border">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-display text-4xl text-text">Timeline</h1>
          
          <div className="flex items-center gap-4 text-text">
            <RefreshCw className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" />
            <Lock className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search memories..." 
            className="w-full bg-[#F5F5F5] dark:bg-surface border border-transparent rounded-sm py-3 pl-10 pr-4 text-sm outline-none focus:border-border transition-colors placeholder:text-muted"
          />
        </div>

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
          <div className="text-center py-20">
            <p className="text-muted mb-4">No entries yet.</p>
            <a href="/entry/new" className="text-primary font-medium border-b border-primary/30 hover:border-primary pb-0.5">Start writing</a>
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
                      journalName={entry.journal.name}
                      tags={entry.tags.map((t: any) => t.tag.name)}
                      onDeleted={handleEntryDeleted}
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

      {/* Right Sidebar (Calendar/Archive) */}
      <div className="hidden lg:block w-80 p-8 shrink-0">
        <div className="border border-border p-6 rounded-sm mb-6 bg-surface">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium cursor-pointer text-muted hover:text-text">{"<"}</span>
            <span className="text-sm font-display font-medium">{format(new Date(), "MMMM yyyy")}</span>
            <span className="text-xs font-medium cursor-pointer text-muted hover:text-text">{">"}</span>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] text-muted font-medium mb-4 uppercase tracking-wider">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 text-center text-sm gap-y-4">
            <div className="text-transparent">0</div><div className="text-transparent">0</div><div className="text-transparent">0</div><div className="text-transparent">0</div><div className="text-transparent">0</div><div className="text-transparent">0</div><div className="text-transparent">0</div>
            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>
            <div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div>
            <div>14</div>
            <div className="relative border border-text px-1 font-medium flex flex-col items-center rounded-sm bg-background">
              15
              <div className="w-1 h-1 bg-text rounded-full absolute -bottom-2"></div>
            </div>
            <div>16</div><div>17</div><div>18</div><div>19</div><div>20</div>
            <div>21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div><div>27</div>
            <div className="relative border border-text px-1 font-medium flex flex-col items-center rounded-sm bg-background">
              28
              <div className="w-1 h-1 bg-text rounded-full absolute -bottom-2"></div>
            </div>
            <div>29</div><div>30</div><div>31</div>
          </div>
        </div>

        <div className="border border-border p-6 rounded-sm bg-surface">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted mb-4">Archive</h4>
          <div className="space-y-3">
            <div className="text-sm font-display text-text cursor-pointer hover:opacity-70 transition-opacity">2023</div>
            <div className="text-sm font-display text-muted cursor-pointer hover:text-text transition-colors">2022</div>
            <div className="text-sm font-display text-muted cursor-pointer hover:text-text transition-colors">2021</div>
          </div>
        </div>
      </div>
    </div>
  );
}
