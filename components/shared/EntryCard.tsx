"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import MoodDot from "./MoodDot";
import { Mood } from "@prisma/client";
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { useToast, ToastContainer } from "./Toast";
import { useRouter } from "next/navigation";

interface EntryCardProps {
  id: string;
  title: string | null;
  bodyText: string | null;
  entryDate: string | Date;
  mood: Mood | null;
  journalName: string;
  tags: string[];
  onDeleted?: (id: string) => void; // called after successful delete so parent can remove from list
}

export default function EntryCard({ id, title, bodyText, entryDate, mood, journalName, tags, onDeleted }: EntryCardProps) {
  const dateObj = typeof entryDate === "string" ? parseISO(entryDate) : entryDate;
  const displayTitle = title || "Untitled Entry";
  const displaySnippet = bodyText ? bodyText : "No content.";

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setConfirmOpen(false);
      addToast("Entry deleted");
      // Give toast time to show, then remove or notify parent
      setTimeout(() => {
        if (onDeleted) {
          onDeleted(id);
        } else {
          router.refresh();
        }
      }, 800);
    } catch {
      addToast("Failed to delete entry. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link
          href={`/entry/${id}/edit`}
          className="block bg-surface border border-border p-8 rounded-sm hover:border-text/30 transition-colors"
        >
          <div className="flex items-center gap-2 text-[11px] text-muted mb-4 font-medium uppercase tracking-wider">
            <span>{format(dateObj, "MMM dd")}</span>
            <span>•</span>
            <span>{format(dateObj, "h:mm a")}</span>
            <span>•</span>
            <MoodDot mood={mood} />
          </div>

          <h3 className="font-display text-3xl text-text mb-4">{displayTitle}</h3>

          <p className="font-display text-lg text-text/80 leading-relaxed mb-6 line-clamp-3">
            {displaySnippet}
          </p>

          {tags.length > 0 && (
            <div className="flex gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#F5F5F5] dark:bg-surface border border-border text-[10px] text-muted uppercase tracking-wider rounded-sm"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-3 py-1 bg-transparent border border-transparent text-[10px] text-muted uppercase tracking-wider rounded-sm">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Overflow menu button — visible on hover */}
        <div
          ref={menuRef}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
        >
          <button
            id={`entry-menu-${id}`}
            onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-border/50 transition-colors"
            aria-label="Entry options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-background border border-border rounded-lg shadow-lg py-1 z-20">
              <Link
                href={`/entry/${id}/edit`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:bg-surface transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="w-3.5 h-3.5 text-muted" />
                Edit entry
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); setConfirmOpen(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete entry
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this entry?"
        description="This cannot be undone. The entry will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        isLoading={deleting}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
