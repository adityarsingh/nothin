"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, Volume2 } from "lucide-react";

export default function RemindersSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("20:00");
  const [channel, setChannel] = useState("browser");

  return (
    <div className="max-w-2xl space-y-12 pb-12">
      
      <section>
        <h2 className="text-2xl font-display mb-2">Daily Reminders</h2>
        <p className="text-muted text-sm mb-6">Build a consistent journaling habit with gentle nudges.</p>
        
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg border transition-colors ${enabled ? 'bg-primary border-primary text-background' : 'bg-background border-border text-muted'}`}>
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Enable Reminders</h3>
                <p className="text-sm text-muted mt-1">Receive a notification to write today.</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <div className={`space-y-8 transition-opacity duration-300 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="block text-sm font-medium mb-3">Time of Day</label>
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="p-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm font-medium w-full sm:w-auto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3">Notification Channel</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`
                  flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                  ${channel === 'browser' ? 'bg-primary/5 border-primary text-text' : 'bg-background border-border text-muted hover:border-primary/50'}
                `}>
                  <input 
                    type="radio" 
                    name="channel" 
                    value="browser"
                    checked={channel === 'browser'}
                    onChange={() => setChannel("browser")}
                    className="hidden"
                  />
                  <Smartphone className={`w-5 h-5 ${channel === 'browser' ? 'text-primary' : ''}`} />
                  <div>
                    <p className="font-medium text-sm">Push Notification</p>
                    <p className="text-xs mt-0.5 opacity-80">Requires browser permission</p>
                  </div>
                </label>
                
                <label className={`
                  flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                  ${channel === 'email' ? 'bg-primary/5 border-primary text-text' : 'bg-background border-border text-muted hover:border-primary/50'}
                `}>
                  <input 
                    type="radio" 
                    name="channel" 
                    value="email"
                    checked={channel === 'email'}
                    onChange={() => setChannel("email")}
                    className="hidden"
                  />
                  <Mail className={`w-5 h-5 ${channel === 'email' ? 'text-primary' : ''}`} />
                  <div>
                    <p className="font-medium text-sm">Email Digest</p>
                    <p className="text-xs mt-0.5 opacity-80">Sent to your primary address</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => alert("Test reminder sent!")}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-text hover:bg-surface transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Send Test Reminder
              </button>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
