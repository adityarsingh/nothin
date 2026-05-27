"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [journalName, setJournalName] = useState("Personal");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    } else if (user?.firstName) {
      setName(user.firstName);
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          journalName,
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime : null,
        }),
      });

      if (res.ok) {
        router.push("/today");
      } else {
        console.error("Failed to create user", await res.text());
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-xl shadow-md">
        
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-display text-3xl text-text">Welcome to Nothin.</h1>
            <div>
              <label className="block text-sm font-medium text-text mb-2">What should we call you?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full py-3 bg-primary text-background rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Journal Name */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-display text-3xl text-text">Your First Journal</h1>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Name your journal</label>
              <input
                type="text"
                value={journalName}
                onChange={(e) => setJournalName(e.target.value)}
                placeholder="e.g. Personal"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="w-1/3 py-3 bg-background text-text border border-border rounded-lg font-medium hover:bg-surface transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!journalName.trim()}
                className="w-2/3 py-3 bg-primary text-background rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Reminders */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-display text-3xl text-text">Make it a habit</h1>
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-lg hover:bg-background transition-colors mb-4">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
                <span className="text-text font-medium">I want a daily reminder to write</span>
              </label>

              {reminderEnabled && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-sm font-medium text-text mb-2">What time works best?</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="w-1/3 py-3 bg-background text-text border border-border rounded-lg font-medium hover:bg-surface transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-primary text-background rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center"
              >
                {isSubmitting ? "Saving..." : "Start Journaling"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
