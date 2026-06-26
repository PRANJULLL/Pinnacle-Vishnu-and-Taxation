"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCardsSkeleton } from "@/components/shared/loading-skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { reportsApi } from "@/lib/api";
import type { ReportStats } from "@/lib/types";
import { formatCurrency } from "@/lib/constants";
import { toast } from "sonner";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await reportsApi.getStats();
        setStats(data);
      } catch {
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportExcel = () => {
    window.open(reportsApi.exportExcel(), "_blank");
    toast.success("Excel export started");
  };

  const handleExportPdf = () => {
    window.open(reportsApi.exportPdf(), "_blank");
    toast.success("PDF export started");
  };

  const cards = stats
    ? [
        { label: "Revenue", value: formatCurrency(stats.revenue), icon: IndianRupee, color: "text-blue-600" },
        { label: "Completed Tasks", value: stats.completedTasks, icon: CheckCircle2, color: "text-green-600" },
        { label: "Pending Tasks", value: stats.pendingTasks, icon: Clock, color: "text-yellow-600" },
        { label: "Stuck Tasks", value: stats.stuckTasks, icon: AlertTriangle, color: "text-red-600" },
      ]
    : [];

  return (
    <div>
      <Header
        title="Reports"
        subtitle="Business analytics and export tools"
        showClientFilter={false}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={handleExportPdf}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />
      <div className="space-y-6 p-6">
        {loading || !stats ? (
          <StatsCardsSkeleton />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {label}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Employee Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.employeePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" name="Total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
