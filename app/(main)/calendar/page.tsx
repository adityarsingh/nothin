"use client";

import { useEffect, useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  isSameDay
} from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import EntryCard from "../../../components/shared/EntryCard";
import MoodDot from "../../../components/shared/MoodDot";
import { TimelineSkeleton } from "../../../components/shared/SkeletonLoader";
import { Mood } from "@prisma/client";

interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
  moods: Mood[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  
  // Side Panel State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [panelEntries, setPanelEntries] = useState<any[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  // Fetch month aggregated data
  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const res = await fetch(`/api/entries/calendar?year=${year}&month=${month}`);
        if (res.ok) {
          const data: DayData[] = await res.json();
          const dataMap = data.reduce((acc, item) => {
            acc[item.date] = item;
            return acc;
          }, {} as Record<string, DayData>);
          setMonthData(dataMap);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, [currentDate]);

  // Fetch specific day entries
  useEffect(() => {
    if (!selectedDate) return;
    const fetchDayEntries = async () => {
      setPanelLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(`/api/entries?date=${dateStr}&limit=50`);
        if (res.ok) {
          const data = await res.json();
          setPanelEntries(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setPanelLoading(false);
      }
    };
    fetchDayEntries();
  }, [selectedDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Calendar Grid Setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Calendar Area */}
      <div className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all ${selectedDate ? 'md:mr-96' : ''}`}>
        <div className="max-w-4xl mx-auto w-full">
          <header className="flex items-center justify-between mb-12">
            <h1 className="font-display text-4xl text-text">Calendar</h1>
            <div className="flex items-center gap-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-surface rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted hover:text-text" />
              </button>
              <span className="font-medium text-lg min-w-[120px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={handleNextMonth} className="p-2 hover:bg-surface rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-muted hover:text-text" />
              </button>
            </div>
          </header>

          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border bg-background/50">
              {weekDays.map(day => (
                <div key={day} className="py-3 text-center text-xs font-medium text-muted uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[120px]">
              {days.map((day, idx) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const data = monthData[dateStr];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);

                return (
                  <div 
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 border-border cursor-pointer transition-colors
                      ${idx % 7 !== 6 ? 'border-r' : ''} 
                      ${idx < days.length - 7 ? 'border-b' : ''}
                      ${!isCurrentMonth ? 'bg-background/40 opacity-50' : 'hover:bg-background/80'}
                      ${isSelected ? 'bg-background ring-2 ring-primary ring-inset' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                        ${today ? 'bg-primary text-background font-bold' : 'text-text font-medium'}
                      `}>
                        {format(day, "d")}
                      </span>
                      {data && data.count > 0 && (
                        <span className="text-xs text-muted font-medium bg-background px-1.5 rounded">
                          {data.count}
                        </span>
                      )}
                    </div>
                    
                    {/* Mood Dots */}
                    {data && data.moods && data.moods.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                        {data.moods.map((mood, i) => (
                          <MoodDot key={i} mood={mood} className="w-3 h-3" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel (Desktop overlay / Mobile sheet) */}
      {selectedDate && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-surface border-l border-border shadow-2xl z-20 flex flex-col transform transition-transform animate-in slide-in-from-right-full duration-300">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-display text-2xl text-text">
              {format(selectedDate, "MMM d, yyyy")}
            </h2>
            <button 
              onClick={() => setSelectedDate(null)}
              className="p-2 hover:bg-background rounded-full transition-colors text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {panelLoading ? (
              <TimelineSkeleton />
            ) : panelEntries.length === 0 ? (
              <div className="text-center py-12 text-muted">
                No entries on this day.
              </div>
            ) : (
              <div className="space-y-4">
                {panelEntries.map(entry => (
                  <EntryCard 
                    key={entry.id}
                    id={entry.id}
                    title={entry.title}
                    bodyText={entry.bodyText}
                    entryDate={entry.entryDate}
                    mood={entry.mood}
                    journalName={entry.journal.name}
                    tags={entry.tags.map((t: any) => t.tag.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
