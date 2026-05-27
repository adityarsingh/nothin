"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";
import { X, Sparkles, TrendingUp, Calendar, Hash, PenTool, Flame } from "lucide-react";

const MOOD_COLORS = {
  VERY_LOW: "var(--color-primary, #01696F)",
  LOW: "var(--color-primary, #01696F)",
  NEUTRAL: "var(--color-primary, #01696F)",
  HIGH: "var(--color-primary, #01696F)",
  VERY_HIGH: "var(--color-primary, #01696F)"
};

export default function ReflectionsPage() {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString());
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [weekRes, monthRes] = await Promise.all([
        fetch(`/api/reflections/weekly?weekStart=${weekStart}`).then(r => r.json()),
        fetch(`/api/reflections/monthly?month=${format(new Date(), "MM")}&year=${format(new Date(), "yyyy")}`).then(r => r.json())
      ]);
      
      setWeeklyData(weekRes);
      setMonthlyData(monthRes);
      setLoading(false);
    };
    
    fetchData();
  }, [weekStart]);

  const dismissWeekly = async () => {
    await fetch("/api/reflections/weekly/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart })
    });
    setWeeklyData({ ...weeklyData, dismissed: true });
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 w-48 bg-surface rounded-xl"></div>
        <div className="h-96 w-full bg-surface rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-12 pb-24">
      <header>
        <h1 className="font-display text-4xl text-text flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          Reflections
        </h1>
        <p className="text-muted mt-2">Discover insights and patterns from your journaling.</p>
      </header>

      {/* Weekly Review */}
      {weeklyData && !weeklyData.dismissed && (
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 relative">
          <button 
            onClick={dismissWeekly}
            className="absolute top-4 right-4 p-2 text-muted hover:text-text rounded-full hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-display mb-6">Your Week in Review</h2>
          
          {weeklyData.empty ? (
            <p className="text-muted text-center py-12">No entries for this week yet. Start writing to see your insights!</p>
          ) : (
            <div className="space-y-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Entries</p>
                  <p className="text-2xl font-display">{weeklyData.totalEntries}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Words</p>
                  <p className="text-2xl font-display">{weeklyData.totalWords}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Top Day</p>
                  <p className="text-lg font-display flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    {weeklyData.mostActiveDay}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Top Tag</p>
                  <p className="text-lg font-display flex items-center gap-1 mt-1 truncate">
                    <Hash className="w-4 h-4 text-primary" />
                    {weeklyData.topTags.length > 0 ? weeklyData.topTags[0].name : "None"}
                  </p>
                </div>
              </div>

              {/* Mood Trend Chart */}
              <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="font-medium flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Mood Trend
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData.trend}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                      <YAxis domain={[1, 5]} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: any) => [val, "Mood Score"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="var(--color-primary)" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: "var(--color-primary)" }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Prompts */}
              <div>
                <h3 className="font-medium mb-4">Prompts for you</h3>
                <div className="space-y-3">
                  {weeklyData.prompts.map((prompt: string, idx: number) => (
                    <div key={idx} className="bg-background border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <p className="font-medium text-sm">{prompt}</p>
                      <Link 
                        href={`/entry/new?prompt=${encodeURIComponent(prompt)}`}
                        className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <PenTool className="w-4 h-4" />
                        Write response
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          )}
        </section>
      )}

      {/* Monthly Review */}
      {monthlyData && (
        <section className="space-y-8">
          <h2 className="text-3xl font-display">Your {format(new Date(), "MMMM")} in Nothin</h2>
          
          {monthlyData.empty ? (
            <p className="text-muted">No entries for this month yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Stats Column */}
              <div className="space-y-4">
                <div className="bg-surface rounded-2xl p-6 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted uppercase tracking-wider mb-1">Longest Streak</p>
                    <p className="text-3xl font-display flex items-center gap-2">
                      {monthlyData.longestStreak} days <Flame className="w-6 h-6 text-orange-500" />
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-2xl p-6 border border-border">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Entries</p>
                    <p className="text-2xl font-display">{monthlyData.totalEntries}</p>
                  </div>
                  <div className="bg-surface rounded-2xl p-6 border border-border">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Words</p>
                    <p className="text-2xl font-display">{monthlyData.totalWords}</p>
                  </div>
                </div>

                {monthlyData.topPerson && (
                  <div className="bg-surface rounded-2xl p-6 border border-border">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Top Person Mentioned</p>
                    <p className="text-xl font-display">{monthlyData.topPerson}</p>
                  </div>
                )}
              </div>

              {/* Charts Column */}
              <div className="space-y-4">
                <div className="bg-surface rounded-2xl p-6 border border-border h-[300px] flex flex-col">
                  <h3 className="font-medium mb-2">Mood Distribution</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyData.moodDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {monthlyData.moodDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={(MOOD_COLORS as any)[entry.name] || "#ccc"} opacity={1 - (index * 0.15)} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tag Cloud */}
              {monthlyData.topTags.length > 0 && (
                <div className="md:col-span-2 bg-surface rounded-2xl p-6 border border-border">
                  <h3 className="font-medium mb-4">Top Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {monthlyData.topTags.map((tag: any) => (
                      <div key={tag.name} className="px-4 py-2 bg-background border border-border rounded-full text-sm font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        {tag.name}
                        <span className="text-xs text-muted ml-1 bg-surface px-1.5 py-0.5 rounded-full">{tag.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlighted Entry */}
              {monthlyData.suggestedEntries.length > 0 && (
                <div className="md:col-span-2 space-y-4 mt-4">
                  <h3 className="font-medium">Monthly Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {monthlyData.suggestedEntries.map((entry: any) => (
                      <Link key={entry.id} href={`/entry/${entry.id}/edit`} className="block group">
                        <div className="p-5 bg-surface border border-border rounded-xl transition-all duration-200 group-hover:border-primary group-hover:shadow-sm h-full">
                          <p className="text-xs text-muted mb-2">{format(new Date(entry.date), "MMM d")}</p>
                          <h4 className="font-display text-lg mb-2 text-text group-hover:text-primary transition-colors line-clamp-1">{entry.title}</h4>
                          <p className="text-sm text-muted line-clamp-3">{entry.snippet}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </section>
      )}

    </div>
  );
}
