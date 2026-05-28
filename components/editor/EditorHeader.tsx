import { ArrowLeft, CheckCircle2, Loader2, CircleDot, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface EditorHeaderProps {
  journalName: string;
  saveStatus: "Saved" | "Saving..." | "Unsaved changes";
  onPublish: () => void;
  isPublishing: boolean;
  isEditMode?: boolean;
  onDelete?: () => void; // only shown in edit mode
}

export default function EditorHeader({
  journalName,
  saveStatus,
  onPublish,
  isPublishing,
  isEditMode = false,
  onDelete,
}: EditorHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex-1">
        <Link
          href="/today"
          className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 text-center font-display text-xl text-text">
        {journalName}
      </div>

      <div className="flex-1 flex justify-end items-center gap-2 text-sm">
        {saveStatus === "Saving..." && (
          <span className="flex items-center gap-1.5 text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving...
          </span>
        )}
        {saveStatus === "Saved" && (
          <span className="flex items-center gap-1.5 text-muted">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
        {saveStatus === "Unsaved changes" && (
          <span className="flex items-center gap-1.5 text-muted mr-2">
            <CircleDot className="w-3.5 h-3.5" />
            Unsaved changes
          </span>
        )}

        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="ml-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPublishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isPublishing
            ? (isEditMode ? "Saving..." : "Publishing...")
            : (isEditMode ? "Save Changes" : "Publish")}
        </button>

        {/* Overflow menu — only in edit mode */}
        {isEditMode && onDelete && (
          <div ref={menuRef} className="relative">
            <button
              id="editor-overflow-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-surface border border-border transition-colors"
              aria-label="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-44 bg-background border border-border rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
