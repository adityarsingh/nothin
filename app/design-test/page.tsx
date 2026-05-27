"use client";

import { useEffect, useState } from "react";

export default function DesignTest() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background p-8 space-y-16">
      <header className="flex justify-between items-center pb-8 border-b border-border">
        <h1 className="font-display text-4xl text-text">Design System Test</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-md bg-surface border border-border text-text text-sm font-medium hover:bg-background transition-colors"
        >
          Toggle Theme ({theme})
        </button>
      </header>

      <section>
        <h2 className="font-display text-2xl mb-4 text-muted">Surface Layers & Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
            <div className="text-sm font-medium text-text">Background</div>
            <div className="text-xs text-muted mt-1">var(--color-background)</div>
          </div>
          <div className="p-4 bg-surface border border-border rounded-lg shadow-sm">
            <div className="text-sm font-medium text-text">Surface</div>
            <div className="text-xs text-muted mt-1">var(--color-surface)</div>
          </div>
          <div className="p-4 bg-primary text-background rounded-lg shadow-sm">
            <div className="text-sm font-medium">Primary Accent</div>
            <div className="text-xs mt-1 opacity-80">var(--color-primary)</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4 text-muted">Type Specimen</h2>
        <div className="space-y-4 bg-surface p-6 rounded-xl border border-border shadow-md">
          <div>
            <h1 className="font-display text-5xl text-text">Display Heading (H1)</h1>
            <p className="text-sm text-muted mt-1">Instrument Serif • 48px</p>
          </div>
          <div>
            <h2 className="font-display text-3xl text-text">Section Heading (H2)</h2>
            <p className="text-sm text-muted mt-1">Instrument Serif • 30px</p>
          </div>
          <div>
            <p className="font-body text-base text-text">
              Body Text: Nothin is a privacy-first journaling application designed to feel like a well-made notebook. It provides a calm, minimal space to write, reflect, and remember.
            </p>
            <p className="text-sm text-muted mt-1">Geist Sans • 16px</p>
          </div>
          <div>
            <p className="font-body text-sm text-muted">
              Muted Text: Use this for timestamps, subtle hints, and secondary information.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4 text-muted">Button Variants</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-surface border border-border rounded-xl shadow-md">
          <button className="px-4 py-2 bg-primary text-background rounded-md font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-surface text-text border border-border rounded-md font-medium text-sm hover:bg-background transition-colors shadow-sm">
            Secondary Button
          </button>
          <button className="px-4 py-2 text-muted hover:text-text rounded-md font-medium text-sm transition-colors">
            Ghost Button
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4 text-muted">Components</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sample Card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">May 27, 2026</span>
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h3 className="font-display text-2xl mb-2 text-text">A clear mind</h3>
              <p className="text-text line-clamp-3">
                Today was remarkably quiet. I spent most of the morning organizing my thoughts and setting up the foundations for a new project. There's something incredibly satisfying about a blank canvas...
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <span className="px-2 py-1 text-xs bg-background border border-border rounded-md text-muted">Work</span>
              <span className="px-2 py-1 text-xs bg-background border border-border rounded-md text-muted">Reflection</span>
            </div>
          </div>

          {/* Form Input */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-md">
            <h3 className="font-display text-xl mb-4 text-text">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1" htmlFor="journal-name">
                  Journal Name
                </label>
                <input
                  id="journal-name"
                  type="text"
                  placeholder="e.g. Personal Thoughts"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1" htmlFor="bio">
                  Description
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="What is this journal for?"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
