"use client";

import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClientFilterBar } from "./client-filter-bar";

interface HeaderProps {
  title: string;
  subtitle?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  showClientFilter?: boolean;
  actions?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  search,
  onSearchChange,
  showClientFilter = true,
  actions,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-sm dark:bg-background/80">
      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onSearchChange && (
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, PAN, phone, email..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {actions}
          </div>
        </div>
        {showClientFilter && <ClientFilterBar />}
      </div>
    </header>
  );
}
