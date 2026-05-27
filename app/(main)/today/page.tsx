"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import Link from "next/link";
import { History, ChevronRight, Sparkles, X, Sun, Moon, Cloud } from "lucide-react";
import EntryCard from "../../../components/shared/EntryCard";
import { TimelineSkeleton } from "../../../components/shared/SkeletonLoader";

export default function TodayPage() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<{ today: any[]; onThisDay: any[]; recent: any[] } | null>(null);
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, memoryRes] = await Promise.all([
          fetch("/api/entries/today"),
          fetch("/api/reflections/memory-resurface")
        ]);
        
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
        
        if (memoryRes.ok && !sessionStorage.getItem("nothin_memory_shown")) {
          const mJson = await memoryRes.json();
          if (mJson.memories && mJson.memories.length > 0) {
            setMemory(mJson.memories[0]);
            sessionStorage.setItem("nothin_memory_shown", "true");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-8 md:p-16 max-w-4xl min-h-screen">
        <TimelineSkeleton />
      </div>
    );
  }

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "";

  return (
    <div className="p-8 md:p-16 max-w-4xl min-h-screen flex flex-col">
      
      <div className="mb-24 mt-12">
        <p className="text-lg text-muted mb-10 font-medium">
          {format(new Date(), "EEEE, MMMM dd")}
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-text mb-12">
          {getGreeting()}{firstName ? `, ${firstName}.` : "."}
        </h1>
        
        <Link href="/entry/new" className="block w-full">
          <div className="w-full text-xl text-muted/60 bg-transparent outline-none cursor-text relative pb-12 hover:text-muted transition-colors">
            Start writing...
            <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-muted/30"></div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
        
        {/* On this day / Memory Resurface */}
        <div className="border border-border p-6 rounded-sm bg-surface flex flex-col min-h-[260px] relative group">
          {memory && (
            <button 
              onClick={(e) => { e.preventDefault(); setMemory(null); }}
              className="absolute top-6 right-6 p-1 text-muted hover:text-text rounded-full hover:bg-background transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text">
              {memory ? (
                <><Sparkles className="w-3.5 h-3.5" /> MEMORY RESURFACED</>
              ) : (
                <><History className="w-3.5 h-3.5" /> ON THIS DAY</>
              )}
            </div>
            {!memory && data?.onThisDay && data.onThisDay.length > 0 && (
              <span className="text-xl text-muted font-display">
                {new Date(data.onThisDay[0].entryDate).getFullYear()}
              </span>
            )}
          </div>
          
          <div className="mt-auto">
            {memory ? (
              <>
                <h3 className="font-display text-2xl text-text mb-4">{memory.title}</h3>
                {memory.type === 'on-this-day' && memory.entry && (
                  <>
                    <p className="font-display text-lg text-text/80 italic mb-6 leading-relaxed line-clamp-3">
                      "{memory.entry.snippet}"
                    </p>
                    <Link href={`/entry/${memory.entry.id}/edit`} className="text-xs font-medium text-text border-b border-text/30 hover:border-text pb-0.5 transition-colors">
                      Read full entry
                    </Link>
                  </>
                )}
                {memory.type === 'frequent-tag' && (
                  <p className="font-display text-lg text-text/80 italic mb-6 leading-relaxed">
                    {memory.description}
                  </p>
                )}
              </>
            ) : data?.onThisDay && data.onThisDay.length > 0 ? (
              <>
                <p className="font-display text-lg text-text italic mb-6 leading-relaxed line-clamp-3">
                  "{data.onThisDay[0].bodyText?.slice(0, 150)}..."
                </p>
                <Link href={`/entry/${data.onThisDay[0].id}/edit`} className="text-xs font-medium text-text border-b border-text/30 hover:border-text pb-0.5 transition-colors">
                  Read full entry
                </Link>
              </>
            ) : (
              <p className="font-display text-lg text-muted italic mb-6 leading-relaxed">
                Nothing recorded on this day in previous years. Your history starts here.
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Recent Entries */}
          <div className="border border-border p-6 rounded-sm bg-surface flex-1">
            <div className="text-xs font-medium uppercase tracking-wider text-text mb-6">
              RECENT ENTRIES
            </div>
            <div className="space-y-3">
              {data?.recent && data.recent.length > 0 ? (
                data.recent.slice(0, 3).map((entry) => (
                  <Link 
                    key={entry.id}
                    href={`/entry/${entry.id}/edit`}
                    className="flex items-center justify-between p-4 border border-border bg-[#F9F9F9] dark:bg-background rounded-sm cursor-pointer hover:border-text/30 transition-colors"
                  >
                    <span className="text-sm font-display text-text truncate max-w-[200px]">
                      {entry.title || "Untitled"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="p-4 text-sm text-muted">No recent entries.</div>
              )}
            </div>
          </div>

          {/* Today's Entries Summary */}
          {data?.today && data.today.length > 0 && (
            <div className="border border-border p-6 rounded-sm bg-surface">
              <div className="text-xs font-medium uppercase tracking-wider text-text mb-4">
                WRITTEN TODAY
              </div>
              <h3 className="font-display text-3xl text-text">
                {data.today.length} {data.today.length === 1 ? "Entry" : "Entries"}
              </h3>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
