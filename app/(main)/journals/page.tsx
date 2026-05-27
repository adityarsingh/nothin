"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function JournalsHubPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Journal State
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJournalName, setNewJournalName] = useState("");
  const [newJournalDesc, setNewJournalDesc] = useState("");

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journals");
      if (res.ok) {
        const data = await res.json();
        setJournals(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newJournalName.trim(),
          description: newJournalDesc.trim() 
        })
      });
      if (res.ok) {
        const newJournal = await res.json();
        setJournals([...journals, { ...newJournal, _count: { entries: 0 } }]);
        setNewJournalName("");
        setNewJournalDesc("");
        setShowCreateForm(false);
      } else {
        alert("Failed to create journal");
      }
    } catch (e) {
      alert("Error creating journal");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex w-full h-full min-h-screen">
      <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <h1 className="font-display text-4xl text-text mb-2">Journals</h1>
            <p className="text-muted">Manage your spaces and view isolated timelines.</p>
          </div>
          
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Journal
          </button>
        </header>

        {showCreateForm && (
          <div className="mb-12 p-6 border border-border rounded-sm bg-surface">
            <h2 className="font-display text-2xl text-text mb-4">Create New Journal</h2>
            <form onSubmit={handleCreateJournal} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newJournalName}
                  onChange={(e) => setNewJournalName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Dream Log"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Description (Optional)</label>
                <textarea
                  value={newJournalDesc}
                  onChange={(e) => setNewJournalDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none h-20"
                  placeholder="What will you write about here?"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm text-muted hover:text-text transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newJournalName.trim()}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-sm">
            <Book className="w-8 h-8 text-muted mx-auto mb-4" />
            <p className="text-text font-medium mb-1">No journals yet</p>
            <p className="text-muted text-sm mb-4">Create your first journal to start writing.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="text-primary font-medium text-sm hover:underline"
            >
              Create Journal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => (
              <Link 
                href={`/journals/${journal.id}`} 
                key={journal.id}
                className="group block p-6 border border-border rounded-sm bg-surface hover:border-primary transition-colors relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />
                <div className="flex justify-between items-start mb-4">
                  <Book className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium text-muted bg-background px-2 py-1 rounded">
                    {journal._count?.entries || 0} entries
                  </span>
                </div>
                <h3 className="font-display text-2xl text-text mb-2 truncate">{journal.name}</h3>
                {journal.description ? (
                  <p className="text-sm text-muted line-clamp-2 mb-4 h-10">{journal.description}</p>
                ) : (
                  <div className="h-10 mb-4" /> // spacer
                )}
                <div className="text-[10px] uppercase tracking-widest text-muted font-medium pt-4 border-t border-border">
                  Created {format(new Date(journal.createdAt), "MMM d, yyyy")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
