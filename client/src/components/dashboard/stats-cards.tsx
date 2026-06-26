"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CalendarCheck,
} from "lucide-react";

const statConfig = [
  { 
    key: "total" as const, 
    label: "Total Tasks", 
    icon: CheckSquare, 
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-t-4 border-t-blue-500"
  },
  { 
    key: "pending" as const, 
    label: "Pending Tasks", 
    icon: Clock, 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-t-4 border-t-amber-500"
  },
  { 
    key: "completed" as const, 
    label: "Completed Tasks", 
    icon: CheckCircle2, 
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-t-4 border-t-emerald-500"
  },
  { 
    key: "stuck" as const, 
    label: "Stuck Tasks", 
    icon: AlertTriangle, 
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-t-4 border-t-rose-500"
  },
  { 
    key: "todayTasks" as const, 
    label: "Today's Tasks", 
    icon: Calendar, 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-t-4 border-t-purple-500"
  },
  { 
    key: "todayCompleted" as const, 
    label: "Today's Completed", 
    icon: CalendarCheck, 
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-t-4 border-t-teal-500"
  },
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {statConfig.map(({ key, label, icon: Icon, color, bgColor, borderColor }) => (
        <Card key={key} className={cn("border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300", borderColor)}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-muted-foreground">
              {label}
            </CardTitle>
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", bgColor)}>
              <Icon className={cn("h-6 w-6", color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold tracking-tight">{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
