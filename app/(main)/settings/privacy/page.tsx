"use client";

import { useState, useEffect } from "react";
import { Download, Laptop, Smartphone, Globe, AlertTriangle, Trash2, HardDrive, ShieldCheck, Cloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser, useClerk } from "@clerk/nextjs";

export default function PrivacySettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  
  const [exportJournal, setExportJournal] = useState("");
  const [exporting, setExporting] = useState(false);
  
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/user/storage-stats").then(r => r.json()).then(setStats);
    fetch("/api/sessions").then(r => r.json()).then(setSessions);
    fetch("/api/journals").then(r => r.json()).then(setJournals);
  }, []);

  const revokeSession = async (id: string) => {
    if (!confirm("Revoke this session?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleExport = async (format: "markdown" | "json") => {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, journalId: exportJournal || undefined })
      });
      
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nothin_export_${new Date().toISOString().split('T')[0]}.${format === "json" ? "json" : "zip"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllEntries = async () => {
    if (deleteInput !== "DELETE") {
      alert("Please type DELETE to confirm.");
      return;
    }
    
    if (!confirm("Are you absolutely sure you want to delete all entries? This action cannot be undone after 30 days.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/entries", { method: "DELETE" });
      if (res.ok) {
        alert("All entries have been deleted.");
        setDeleteInput("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.primaryEmailAddress?.emailAddress) {
      alert("Please type your email address to confirm.");
      return;
    }
    
    if (!confirm("Are you absolutely sure you want to delete your account? This action is permanent.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (res.ok) {
        await signOut();
      }
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto py-12 px-6">
      
      <div className="mb-10">
        <p className="text-sm font-medium mb-4">Privacy Center</p>
        <p className="text-base text-muted">Your thoughts stay yours. Review and control how your data is protected.</p>
      </div>

      <div className="space-y-12">
        {/* Storage Overview */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EFEFEF] dark:bg-surface border border-border p-5 rounded-sm flex items-center gap-4">
              <div className="bg-[#E3E8DF] dark:bg-background p-2.5 rounded-full">
                <Cloud className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">Syncing: Encrypted</p>
                <p className="text-sm text-muted">End-to-end secured.</p>
              </div>
            </div>
            <div className="bg-[#EFEFEF] dark:bg-surface border border-border p-5 rounded-sm flex items-center gap-4">
              <div className="bg-[#E3E3E3] dark:bg-background p-2.5 rounded-full">
                <HardDrive className="w-5 h-5 text-muted" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">Storage Usage</p>
                <p className="text-sm text-muted">
                  {stats ? `${(stats.totalBytes / 1024 / 1024).toFixed(1)}MB Local / ${(stats.limitBytes / 1024 / 1024).toFixed(0)}MB Cloud` : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Laptop className="w-5 h-5 text-text" strokeWidth={1.5} />
            <h3 className="font-display text-xl">Active Sessions</h3>
          </div>
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
                <div className="flex items-center gap-4">
                  {session.browser?.toLowerCase().includes("mobile") || session.os?.toLowerCase().includes("ios") || session.os?.toLowerCase().includes("android") ? (
                    <Smartphone className="w-5 h-5 text-text" strokeWidth={1.5} />
                  ) : session.browser ? (
                    <Globe className="w-5 h-5 text-text" strokeWidth={1.5} />
                  ) : (
                    <Laptop className="w-5 h-5 text-text" strokeWidth={1.5} />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {session.browser || "Unknown Browser"} on {session.os || "Unknown OS"} {session.isCurrent && "(Current)"}
                    </p>
                    <p className="text-xs text-muted">
                      {session.ipAddress} • Last active {session.isCurrent ? "just now" : formatDistanceToNow(new Date(session.lastActiveAt)) + " ago"}
                    </p>
                  </div>
                </div>
                {session.isCurrent ? (
                  <span className="px-3 py-1 text-xs bg-[#E3E8DF] dark:bg-background text-text rounded-sm">Active</span>
                ) : (
                  <button 
                    onClick={() => revokeSession(session.id)}
                    className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-sm hover:bg-red-50"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Export Data */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-text" strokeWidth={1.5} />
            <h3 className="font-display text-xl">Export Data</h3>
          </div>
          <div className="bg-surface border border-border rounded-sm p-6 space-y-6">
            <p className="text-sm text-muted">Download a complete copy of your journals and entries.</p>
            <div>
              <label className="block text-sm font-medium mb-2 text-text">Select Journal (Optional)</label>
              <select 
                value={exportJournal} 
                onChange={e => setExportJournal(e.target.value)}
                className="w-full p-2.5 bg-background border border-border rounded-sm outline-none focus:border-text text-sm transition-colors"
              >
                <option value="">All Journals</option>
                {journals.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleExport("markdown")}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-background rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {exporting ? "Generating..." : "Export as Markdown (ZIP)"}
              </button>
              <button 
                onClick={() => handleExport("json")}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-background border border-border text-text rounded-sm text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-8 border-t border-border">
          <div className="flex items-center gap-3 mb-6 text-red-600">
            <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            <h3 className="font-display text-xl">Danger Zone</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Delete All Entries */}
            <div className="border border-red-200/50 bg-[#FCF8F8] dark:bg-red-950/5 rounded-sm p-6 flex flex-col">
              <h3 className="font-medium text-red-600 mb-2">Delete all entries</h3>
              <p className="text-xs text-red-600/80 mb-6 flex-1">
                This will soft-delete all your journal entries. They will be permanently removed after 30 days.
              </p>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Type 'DELETE' to confirm" 
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="w-full p-2.5 bg-background border border-red-200/50 rounded-sm outline-none focus:border-red-500 text-sm placeholder:text-red-300"
                />
                <button 
                  onClick={handleDeleteAllEntries}
                  disabled={isDeleting || deleteInput !== "DELETE"}
                  className="w-full py-2.5 bg-[#B91C1C] text-white rounded-sm text-sm font-medium disabled:opacity-50 hover:bg-[#991B1B] transition-colors"
                >
                  Delete Entries
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="border border-red-200/50 bg-[#FCF8F8] dark:bg-red-950/5 rounded-sm p-6 flex flex-col">
              <h3 className="font-medium text-red-600 mb-2">Delete account</h3>
              <p className="text-xs text-red-600/80 mb-6 flex-1">
                This will permanently delete your account, journals, and all entries immediately. This action cannot be undone.
              </p>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Type your email address" 
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="w-full p-2.5 bg-background border border-red-200/50 rounded-sm outline-none focus:border-red-500 text-sm placeholder:text-red-300"
                />
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteInput !== user?.primaryEmailAddress?.emailAddress}
                  className="w-full py-2.5 bg-[#B91C1C] text-white rounded-sm text-sm font-medium disabled:opacity-50 hover:bg-[#991B1B] transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
            
          </div>
        </section>
      </div>
      
    </div>
  );
}
