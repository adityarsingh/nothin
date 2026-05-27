"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, X, Calendar as CalendarIcon, Hash } from "lucide-react";
import { useDebounce } from "../../../lib/hooks";
import { format } from "date-fns";
import MoodDot from "../../../components/shared/MoodDot";
import Link from "next/link";
import { TimelineSkeleton } from "../../../components/shared/SkeletonLoader";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  
  // Filters
  const [selectedJournals, setSelectedJournals] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false); // mobile toggle
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Data
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Metadata for filters
  const [journals, setJournals] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Fetch filter metadata
    fetch("/api/journals").then(r => r.json()).then(setJournals);
    fetch("/api/tags").then(r => r.json()).then(setTags);
  }, []);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (selectedJournals.length) params.set("journalId", selectedJournals.join(","));
        if (selectedMoods.length) params.set("mood", selectedMoods.join(","));
        if (selectedTags.length) params.set("tags", selectedTags.join(","));
        params.set("sort", sort);
        if (pinnedOnly) params.set("pinnedOnly", "true");
        
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setHasSearched(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only search if there's a query or a filter applied
    if (debouncedQuery || selectedJournals.length > 0 || selectedMoods.length > 0 || selectedTags.length > 0 || pinnedOnly || sort !== "newest") {
      fetchResults();
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery, selectedJournals, selectedMoods, selectedTags, sort, pinnedOnly]);

  const clearFilters = () => {
    setSelectedJournals([]);
    setSelectedMoods([]);
    setSelectedTags([]);
    setSort("newest");
    setPinnedOnly(false);
  };

  const toggleArrayItem = (setter: any, item: string) => {
    setter((prev: string[]) => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen">
      {/* Top Search Bar */}
      <div className="border-b border-border bg-background p-4 md:px-8 sticky top-0 z-20 flex items-center gap-3 shadow-sm">
        <Search className="w-6 h-6 text-muted hidden md:block" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search entries..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-2xl font-display placeholder-muted outline-none w-full"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-2 text-muted hover:text-text rounded-full hover:bg-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`md:hidden p-2 rounded-lg border transition-colors ${showFilters ? 'bg-primary text-background border-primary' : 'border-border text-muted hover:text-text'}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Filter Sidebar */}
        <aside className={`
          absolute md:static inset-y-0 right-0 w-80 bg-surface border-l border-border flex flex-col z-30 transition-transform duration-300 transform
          ${showFilters ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-1"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted uppercase tracking-wider">Sort By</h4>
            </div>
            <select 
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="recently_edited">Recently edited</option>
              <option value="most_words">Longest (most words)</option>
            </select>

            {journals.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted uppercase tracking-wider">Journals</h4>
                {journals.map(j => (
                  <label key={j.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedJournals.includes(j.id) ? 'bg-primary border-primary text-background' : 'border-muted group-hover:border-primary'}`}>
                      {selectedJournals.includes(j.id) && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span className="text-sm text-text">{j.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted uppercase tracking-wider">Mood</h4>
              {['VERY_LOW', 'LOW', 'NEUTRAL', 'HIGH', 'VERY_HIGH'].map(m => (
                <label key={m} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMoods.includes(m) ? 'bg-primary border-primary text-background' : 'border-muted group-hover:border-primary'}`}>
                    {selectedMoods.includes(m) && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <MoodDot mood={m as any} className="w-3 h-3" />
                  <span className="text-sm text-text capitalize">{m.replace('_', ' ').toLowerCase()}</span>
                </label>
              ))}
            </div>

            {tags.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted uppercase tracking-wider">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <button
                      key={t.id}
                      onClick={() => toggleArrayItem(setSelectedTags, t.name)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${selectedTags.includes(t.name) ? 'bg-primary text-background border-primary' : 'bg-background border-border text-muted hover:text-text'}`}
                    >
                      <Hash className="w-3 h-3 inline mr-1 opacity-50" />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${pinnedOnly ? 'bg-primary border-primary text-background' : 'border-muted group-hover:border-primary'}`}>
                  {pinnedOnly && <span className="text-[10px] font-bold">✓</span>}
                </div>
                <span className="text-sm text-text">Pinned only</span>
              </label>
            </div>
          </div>
          
          {(selectedJournals.length > 0 || selectedMoods.length > 0 || selectedTags.length > 0 || pinnedOnly || sort !== "newest") && (
            <div className="p-4 border-t border-border">
              <button 
                onClick={clearFilters}
                className="w-full py-2 text-sm text-muted hover:text-text transition-colors border border-border rounded-lg bg-background"
              >
                Clear all filters
              </button>
            </div>
          )}
        </aside>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-background/50">
          {loading ? (
            <div className="max-w-3xl mx-auto"><TimelineSkeleton /></div>
          ) : !hasSearched ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <Search className="w-12 h-12 text-muted/30 mb-6" />
              <h2 className="text-xl font-display mb-2">Search your thoughts</h2>
              <p className="text-muted text-sm">
                Type above to search across all your journals, or apply filters to narrow down your timeline.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <h2 className="text-xl font-display mb-2">Nothing found</h2>
              <p className="text-muted text-sm">
                We couldn't find any entries matching "{query}". Try broadening your search or clearing your filters.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-medium text-muted mb-6 uppercase tracking-wider">{results.length} results</p>
              
              {results.map(entry => (
                <Link key={entry.id} href={`/entry/${entry.id}/edit`} className="block group">
                  <div className="p-5 bg-surface border border-border rounded-xl transition-all duration-200 group-hover:border-primary group-hover:shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.mood && <MoodDot mood={entry.mood} className="w-2.5 h-2.5" />}
                        <span className="text-xs font-medium text-muted uppercase tracking-wider">
                          {format(new Date(entry.entryDate), "MMM d, yyyy")} • {entry.journalName}
                        </span>
                      </div>
                    </div>
                    
                    {entry.title && <h3 className="font-display text-xl mb-1 text-text group-hover:text-primary transition-colors">{entry.title}</h3>}
                    
                    {entry.snippet && (
                      <p 
                        className="text-sm text-muted line-clamp-3 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: entry.snippet }} 
                      />
                    )}
                    
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {entry.tags.map((t: any) => (
                          <span key={t.name} className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-background border border-border text-muted rounded-full">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile filter overlay backdrop */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden" 
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
