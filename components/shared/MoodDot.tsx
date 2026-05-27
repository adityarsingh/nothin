import { Mood } from "@prisma/client";

interface MoodDotProps {
  mood: Mood | null;
  className?: string;
}

const MOOD_COLORS: Record<Mood, string> = {
  VERY_LOW: "bg-red-500",
  LOW: "bg-orange-400",
  NEUTRAL: "bg-gray-400",
  HIGH: "bg-teal-500",
  VERY_HIGH: "bg-yellow-400",
};

export default function MoodDot({ mood, className = "" }: MoodDotProps) {
  if (!mood) return null;
  const colorClass = MOOD_COLORS[mood] || "bg-border";
  return (
    <div 
      className={`w-2.5 h-2.5 rounded-full ${colorClass} ${className}`} 
      title={`Mood: ${mood.replace("_", " ")}`} 
    />
  );
}
