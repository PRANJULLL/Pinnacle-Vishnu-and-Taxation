"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatsCardsSkeleton } from "@/components/shared/loading-skeleton";
import { useClientFilter } from "@/context/client-filter-context";
import { dashboardApi } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const { selectedClient } = useClientFilter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsData = await dashboardApi.getStats(selectedClient);
        setStats(statsData);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedClient]);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of office task management"
        showClientFilter
      />
      <div className="space-y-6 p-6">
        {loading || !stats ? (
          <StatsCardsSkeleton />
        ) : (
          <StatsCards stats={stats} />
        )}
      </div>
    </div>
  );
}
