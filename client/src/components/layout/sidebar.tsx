"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";

const iconMap = {
  LayoutDashboard,
  CheckSquare,
  Users,
  FileText,
  BarChart3,
  Settings,
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col bg-white dark:bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain rounded-lg shadow-sm" />
        <div>
          <p className="text-xs font-bold leading-none text-foreground">Pinnacle Vishnu</p>
          <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">& Taxation</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">Internal Office Tool</p>
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>
    </aside>
  );
}
