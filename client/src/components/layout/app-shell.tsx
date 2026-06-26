"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Mobile Header Top Bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm dark:bg-card md:hidden">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
          <div>
            <p className="text-xs font-bold leading-none text-foreground">Pinnacle Vishnu</p>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">& Taxation</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform border-r border-border bg-white transition-transform duration-300 ease-in-out dark:bg-card md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setIsOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className="min-h-screen ml-0 md:ml-60">{children}</main>
    </div>
  );
}
