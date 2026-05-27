"use client";

import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export default function GeneralSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  
  // Actually we should store accent color in localStorage or UserSettings in DB.
  // For now, we will just use standard Theme provider if configured, or just simulate it.
  const [accent, setAccent] = useState("teal");
  
  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-2xl space-y-12 pb-12">
      
      {/* Profile */}
      <section>
        <h2 className="text-2xl font-display mb-2">Profile</h2>
        <p className="text-muted text-sm mb-6">Manage your basic profile information.</p>
        
        <div className="space-y-6 bg-surface border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input 
              type="text" 
              defaultValue={user?.fullName || ""}
              className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-muted mt-2">Your name is only visible to you.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              type="text" 
              readOnly
              value={user?.primaryEmailAddress?.emailAddress || ""}
              className="w-full p-2.5 bg-background border border-border rounded-lg outline-none text-muted text-sm opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-2">Managed securely by Clerk. Cannot be changed here.</p>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section>
        <h2 className="text-2xl font-display mb-2">Appearance</h2>
        <p className="text-muted text-sm mb-6">Customize how Nothin looks on this device.</p>
        
        <div className="space-y-8 bg-surface border border-border rounded-xl p-6">
          
          <div>
            <label className="block text-sm font-medium mb-4">Theme</label>
            <div className="grid grid-cols-3 gap-4">
              {['light', 'dark', 'system'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`
                    py-3 px-4 rounded-lg border text-sm font-medium capitalize transition-colors
                    ${mounted && theme === t ? 'bg-primary border-primary text-background' : 'bg-background border-border text-muted hover:border-primary/50'}
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm font-medium mb-4 flex justify-between">
              Accent Color
              <span className="text-xs bg-muted/20 text-muted px-2 py-0.5 rounded-full uppercase tracking-wider">Coming Soon</span>
            </label>
            <div className="flex gap-4">
              {['teal', 'sage', 'sand', 'slate', 'rose'].map(a => (
                <button
                  key={a}
                  onClick={() => setAccent(a)}
                  className={`
                    w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                    ${accent === a ? 'border-text scale-110' : 'border-transparent hover:scale-105'}
                  `}
                  style={{ backgroundColor: `var(--color-${a}-500, #888)` }}
                >
                  {accent === a && <Check className="w-5 h-5 text-background" />}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
