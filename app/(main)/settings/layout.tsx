"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sliders, Bell } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "General", href: "/settings/general", icon: <Sliders className="w-4 h-4" /> },
    { name: "Privacy", href: "/settings/privacy", icon: <Shield className="w-4 h-4" /> },
    { name: "Reminders", href: "/settings/reminders", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto w-full min-h-screen">
      <header className="mb-8 md:mb-12">
        <h1 className="font-display text-4xl text-text">Settings</h1>
      </header>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {tabs.map(tab => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'bg-primary text-background shadow-sm' 
                      : 'text-muted hover:text-text hover:bg-surface'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
