import { useState } from "react";
import { format } from "date-fns";
import { Lock, Unlock, Calendar, Tag as TagIcon, Smile, Book, Plus } from "lucide-react";
import { LocalDraft } from "../../lib/db";
import { useRouter } from "next/navigation";

interface MetadataPanelProps {
  draft: LocalDraft;
  updateDraft: (updates: Partial<LocalDraft>) => void;
  journals: { id: string; name: string }[];
}

const MOODS = [
  { value: "VERY_LOW", emoji: "😞", label: "Very Low" },
  { value: "LOW", emoji: "😔", label: "Low" },
  { value: "NEUTRAL", emoji: "😐", label: "Neutral" },
  { value: "HIGH", emoji: "😊", label: "High" },
  { value: "VERY_HIGH", emoji: "😄", label: "Very High" },
];

export default function MetadataPanel({ draft, updateDraft, journals }: MetadataPanelProps) {
  const [tagInput, setTagInput] = useState("");
  const [isCreatingJournal, setIsCreatingJournal] = useState(false);
  const [showNewJournalInput, setShowNewJournalInput] = useState(false);
  const [newJournalName, setNewJournalName] = useState("");
  const router = useRouter();

  const handleCreateJournal = async () => {
    if (!newJournalName.trim()) return;

    setIsCreatingJournal(true);
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newJournalName.trim() })
      });
      if (res.ok) {
        const newJournal = await res.json();
        updateDraft({ journalId: newJournal.id });
        setNewJournalName("");
        setShowNewJournalInput(false);
        router.refresh();
      } else {
        alert("Failed to create journal");
      }
    } catch (e) {
      alert("Error creating journal");
    } finally {
      setIsCreatingJournal(false);
    }
  };

  const cancelCreateJournal = () => {
    setShowNewJournalInput(false);
    setNewJournalName("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!draft.tags.includes(newTag)) {
        updateDraft({ tags: [...draft.tags, newTag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateDraft({ tags: draft.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="space-y-8">
      {/* Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
          <Calendar className="w-4 h-4" /> Date
        </label>
        <input
          type="date"
          value={draft.entryDate.split("T")[0]}
          onChange={(e) => updateDraft({ entryDate: new Date(e.target.value).toISOString() })}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Mood */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
          <Smile className="w-4 h-4" /> Mood
        </label>
        <div className="flex gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => updateDraft({ mood: mood.value })}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                draft.mood === mood.value
                  ? "bg-primary border-transparent ring-2 ring-primary ring-offset-2 ring-offset-surface"
                  : "bg-background border border-border hover:bg-border"
              }`}
              title={mood.label}
            >
              {mood.emoji}
            </button>
          ))}
          {draft.mood && (
            <button 
              onClick={() => updateDraft({ mood: null })}
              className="text-xs text-muted hover:text-text self-center ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
          <TagIcon className="w-4 h-4" /> Tags
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {draft.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-md text-xs text-text">
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-muted hover:text-text ml-1">&times;</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type and press Enter..."
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Journal */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
          <Book className="w-4 h-4" /> Journal
        </label>
        
        {showNewJournalInput ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Journal Name"
              value={newJournalName}
              onChange={(e) => setNewJournalName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateJournal()}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelCreateJournal}
                className="px-3 py-1.5 text-xs text-muted hover:text-text transition-colors"
                disabled={isCreatingJournal}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJournal}
                disabled={isCreatingJournal || !newJournalName.trim()}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-colors"
              >
                {isCreatingJournal ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={draft.journalId}
              onChange={(e) => updateDraft({ journalId: e.target.value })}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="" disabled>Select a journal</option>
              {journals.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewJournalInput(true)}
              className="p-2 bg-surface border border-border rounded-md text-muted hover:text-text transition-colors"
              title="Create new journal"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Lock */}
      <div className="pt-4 border-t border-border">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            {draft.isLocked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted" />}
            Lock this entry
          </div>
          <input
            type="checkbox"
            checked={draft.isLocked}
            onChange={(e) => updateDraft({ isLocked: e.target.checked })}
            className="w-5 h-5 accent-primary"
          />
        </label>
      </div>
    </div>
  );
}
