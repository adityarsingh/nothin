"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, PenTool, Search, Settings, Lock, Book } from "lucide-react";
import CmdKListener from "../../components/shared/CmdKListener";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-text">
      <CmdKListener />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-border bg-[var(--color-sidebar)] py-8 relative">
        <div className="px-8 mb-10">
          <Link href="/today" className="block">
            <h1 className="font-display text-[28px] tracking-tight mb-1">Nothin</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted font-medium">Private Sanctuary</p>
          </Link>
        </div>

        <div className="px-6 mb-8">
          <Link href="/entry/new" className="flex items-center justify-center gap-2 w-full bg-primary text-background py-3 rounded text-sm font-medium hover:opacity-90 transition-opacity">
            <span className="text-lg leading-none">+</span> New Entry
          </Link>
        </div>
        
        <nav className="flex-1 flex flex-col space-y-1">
          <NavItem href="/today" icon={<PenTool size={18} strokeWidth={2.5} />} label="Today" active={pathname === "/today"} />
          <NavItem href="/timeline" icon={<CalendarDays size={18} strokeWidth={2.5} />} label="Timeline" active={pathname === "/timeline"} />
          <NavItem href="/journals" icon={<Book size={18} strokeWidth={2.5} />} label="Journals" active={pathname.startsWith("/journals")} />
          <NavItem href="/search" icon={<Search size={18} strokeWidth={2.5} />} label="Search" active={pathname === "/search"} />
          
          <div className="mt-8 mb-2 px-8">
            {/* spacer */}
          </div>
          <NavItem href="/settings/privacy" icon={<Lock size={18} strokeWidth={2.5} />} label="Privacy Center" active={pathname.startsWith("/settings/privacy")} />
          <NavItem href="/settings/general" icon={<Settings size={18} strokeWidth={2.5} />} label="Settings" active={pathname === "/settings/general" || pathname === "/settings/reminders"} />
        </nav>
        
        <div className="px-8 mt-auto flex items-center gap-3">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full" } }} />
          <span className="text-xs font-medium text-muted">User Profile</span>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-[var(--color-sidebar)] sticky top-0 z-10">
        <div>
          <h1 className="font-display text-xl tracking-tight leading-none">Nothin</h1>
        </div>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full" } }} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative max-w-full pb-20 md:pb-0 bg-background">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 w-full border-t border-border bg-[var(--color-sidebar)] flex justify-around p-3 z-10">
        <MobileNavItem href="/today" icon={<PenTool size={22} />} active={pathname === "/today"} />
        <MobileNavItem href="/timeline" icon={<CalendarDays size={22} />} active={pathname === "/timeline"} />
        <MobileNavItem href="/entry/new" icon={<div className="bg-primary text-background w-8 h-8 rounded-full flex items-center justify-center font-bold leading-none pb-0.5">+</div>} active={false} />
        <MobileNavItem href="/journals" icon={<Book size={22} />} active={pathname.startsWith("/journals")} />
        <MobileNavItem href="/search" icon={<Search size={22} />} active={pathname === "/search"} />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`relative flex items-center gap-4 px-8 py-3 text-sm font-medium transition-colors ${
        active ? "text-text bg-black/5 dark:bg-white/5" : "text-muted hover:text-text"
      }`}
    >
      <div className="opacity-80">{icon}</div>
      {label}
      {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-text" />}
    </Link>
  );
}

function MobileNavItem({ href, icon, active }: { href: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`p-2 transition-colors ${active ? "text-text" : "text-muted hover:text-text"}`}
    >
      {icon}
    </Link>
  );
}
