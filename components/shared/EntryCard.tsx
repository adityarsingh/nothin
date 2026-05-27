import Link from "next/link";
import { format, parseISO } from "date-fns";
import MoodDot from "./MoodDot";
import { Mood } from "@prisma/client";

interface EntryCardProps {
  id: string;
  title: string | null;
  bodyText: string | null;
  entryDate: string | Date;
  mood: Mood | null;
  journalName: string;
  tags: string[];
}

export default function EntryCard({ id, title, bodyText, entryDate, mood, journalName, tags }: EntryCardProps) {
  const dateObj = typeof entryDate === "string" ? parseISO(entryDate) : entryDate;
  
  const displayTitle = title || "Untitled Entry";
  const displaySnippet = bodyText ? bodyText : "No content.";

  return (
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
      
      <h3 className="font-display text-3xl text-text mb-4 group-hover:text-primary transition-colors">
        {displayTitle}
      </h3>
      
      <p className="font-display text-lg text-text/80 leading-relaxed mb-6 line-clamp-3">
        {displaySnippet}
      </p>

      {tags.length > 0 && (
        <div className="flex gap-2">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-3 py-1 bg-[#F5F5F5] dark:bg-surface border border-border text-[10px] text-muted uppercase tracking-wider rounded-sm">
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
  );
}
