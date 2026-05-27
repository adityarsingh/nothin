import { ArrowLeft, CheckCircle2, Loader2, CircleDot } from "lucide-react";
import Link from "next/link";

interface EditorHeaderProps {
  journalName: string;
  saveStatus: "Saved" | "Saving..." | "Unsaved changes";
  onPublish: () => void;
  isPublishing: boolean;
}

export default function EditorHeader({ journalName, saveStatus, onPublish, isPublishing }: EditorHeaderProps) {
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
          {isPublishing ? "Publishing..." : "Publish"}
        </button>
      </div>
    </header>
  );
}
