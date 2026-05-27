import Link from "next/link";
import { PenTool, Search, Calendar, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import PricingSection from "../components/landing/PricingSection";

export const metadata = {
  title: "Nothin — A private journaling space",
  description: "Nothing to hide. Everything to remember.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-[28px] tracking-tight">Nothin</span>
            <span className="text-[10px] uppercase tracking-widest text-muted font-medium ml-2 hidden sm:inline">Private Sanctuary</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-text transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-background px-4 py-2 rounded-sm hover:opacity-90 transition-opacity">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <h1 className="font-display text-5xl md:text-7xl leading-[1.1] tracking-tight">
            Nothing to hide.<br />
            Everything to remember.
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-lg leading-relaxed">
            A privacy-first journaling space built on the belief that your thoughts belong to no one but you.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto text-center px-8 py-3.5 bg-primary text-background rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
              Start your journal
            </Link>
            <Link href="#features" className="w-full sm:w-auto text-center px-8 py-3.5 bg-transparent border border-border text-muted hover:text-text rounded-sm text-sm font-medium transition-colors">
              Learn about our encryption
            </Link>
          </div>
        </div>
        
        {/* CSS UI Mockup */}
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-[#F5F5F5] dark:bg-surface rounded-sm transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-6 border border-border"></div>
          <div className="relative bg-surface border border-border shadow-sm rounded-sm p-6 md:p-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-border"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted uppercase tracking-widest mb-2">
                <span>Oct 14, 2026</span>
                <span>•</span>
                <span>Personal</span>
              </div>
              <h2 className="font-display text-3xl">The calm after the storm.</h2>
              <div className="space-y-3 pt-2">
                <div className="w-full h-2 bg-muted/20 rounded-sm"></div>
                <div className="w-11/12 h-2 bg-muted/20 rounded-sm"></div>
                <div className="w-4/5 h-2 bg-muted/20 rounded-sm"></div>
                <div className="w-full h-2 bg-muted/20 rounded-sm"></div>
                <div className="w-3/4 h-2 bg-muted/20 rounded-sm"></div>
              </div>
              <div className="flex gap-2 pt-6">
                <div className="px-3 py-1 bg-[#F5F5F5] dark:bg-background border border-border rounded-sm text-[10px] text-muted uppercase tracking-wider">clarity</div>
                <div className="px-3 py-1 bg-[#F5F5F5] dark:bg-background border border-border rounded-sm text-[10px] text-muted uppercase tracking-wider">work</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Promises (Asymmetric Layout) */}
      <section id="features" className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-border">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Block 1: Full width on mobile, spans 2 cols on desktop */}
          <div className="md:col-span-2 bg-surface border border-border rounded-sm p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <div className="w-10 h-10 bg-background border border-border rounded-sm flex items-center justify-center mb-6">
                <Lock className="w-5 h-5 text-text" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-4xl">Private by design.</h3>
              <p className="text-sm text-muted leading-relaxed max-w-md">
                Your entries belong to you. No ads, no tracking, and absolutely no AI reading your thoughts without your explicit permission.
              </p>
            </div>
            <div className="flex-1 w-full bg-[#F5F5F5] dark:bg-background border border-border rounded-sm p-8 relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm">
                  <span className="font-medium text-sm">End-to-End Encryption</span>
                  <ShieldCheck className="w-4 h-4 text-text" />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm opacity-70">
                  <span className="font-medium text-sm">Strict Data Ownership</span>
                  <Check className="w-4 h-4 text-text" />
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Half width */}
          <div className="bg-surface border border-border rounded-sm p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-background border border-border rounded-sm flex items-center justify-center mb-6">
                <Search className="w-5 h-5 text-text" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-3xl mb-4">Write and find.</h3>
              <p className="text-sm text-muted leading-relaxed">
                Full-text search, tags, moods, and a calendar — so your archive never becomes a black hole. Find that one thought from three years ago in milliseconds.
              </p>
            </div>
            <div className="mt-12 bg-background border border-border rounded-sm p-4 flex items-center gap-3">
              <Search className="w-4 h-4 text-muted" />
              <div className="w-full h-3 bg-muted/20 rounded-sm text-[10px] px-2 flex items-center text-muted">"clarity"</div>
            </div>
          </div>

          {/* Block 3: Half width */}
          <div className="bg-surface border border-border rounded-sm p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-background border border-border rounded-sm flex items-center justify-center mb-6">
                <Calendar className="w-5 h-5 text-text" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-3xl mb-4">Reflect over time.</h3>
              <p className="text-sm text-muted leading-relaxed">
                Weekly reviews and memory resurfacing turn your journal into a window into your own patterns. Understand what lifts you up and what weighs you down.
              </p>
            </div>
            <div className="mt-12 flex items-end gap-2 h-16">
              {[3, 4, 2, 5, 4, 3, 5].map((h, i) => (
                <div key={i} className="flex-1 bg-[#EAEAEA] dark:bg-background border border-border rounded-t-sm" style={{ height: `${(h / 5) * 100}%` }}>
                  <div className="w-full h-1 bg-text rounded-t-sm"></div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Feature Highlight: The Editor */}
      <section className="py-32 border-t border-border bg-[#F5F5F5] dark:bg-surface">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-sm text-[10px] font-medium uppercase tracking-widest text-text mb-4">
              <PenTool className="w-3 h-3" /> The Editor
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-text">
              A blank page that gets out of your way.
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              No cluttered sidebars or complex formatting menus. Just a clean typographic canvas with markdown shortcuts, autosave, and gentle prompts when you're stuck.
            </p>
            <ul className="space-y-3 pt-4">
              {[
                "Markdown shortcuts support",
                "Frictionless autosave to local DB",
                "Dynamic prompts based on your mood"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-text">
                  <ArrowRight className="w-4 h-4 text-muted" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full bg-background border border-border rounded-sm p-8 shadow-sm">
            <div className="animate-pulse flex gap-2 mb-8">
              <div className="h-4 w-24 bg-muted/20 rounded-sm"></div>
              <div className="h-4 w-16 bg-muted/20 rounded-sm"></div>
            </div>
            <h3 className="text-3xl font-display mb-4 text-muted/50">What's on your mind?</h3>
            <div className="w-[1px] h-6 bg-text animate-ping"></div>
          </div>
        </div>
      </section>

      {/* 4. Pricing */}
      <PricingSection />

      {/* 5. Privacy Section */}
      <section className="py-32 px-6 md:px-12 max-w-3xl mx-auto text-center border-t border-border">
        <ShieldCheck className="w-10 h-10 text-text mx-auto mb-8" strokeWidth={1.5} />
        <h2 className="text-3xl md:text-4xl font-display mb-6">Built around your trust.</h2>
        <p className="text-sm text-muted leading-relaxed mb-10">
          We don't sell data. We don't run ads. Your journal entries are stored encrypted and can be exported as raw JSON files at any time. If you decide to leave, you can instantly delete your entire account and all associated data with one click.
        </p>
        <Link href="/signup" className="text-text font-medium border-b border-text/30 hover:border-text pb-0.5 text-sm transition-colors">
          Read our full Privacy Manifesto
        </Link>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-border bg-surface py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-[24px] tracking-tight">Nothin</span>
            <span className="text-muted text-[10px] uppercase tracking-widest ml-4">© {new Date().getFullYear()} Nothin Inc.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-medium text-muted hover:text-text transition-colors">Changelog</Link>
            <Link href="#" className="text-xs font-medium text-muted hover:text-text transition-colors">Privacy</Link>
            <Link href="#" className="text-xs font-medium text-muted hover:text-text transition-colors">Terms</Link>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
              <Link href="#" className="text-muted hover:text-text transition-colors text-xs font-medium">X (Twitter)</Link>
              <Link href="#" className="text-muted hover:text-text transition-colors text-xs font-medium">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
