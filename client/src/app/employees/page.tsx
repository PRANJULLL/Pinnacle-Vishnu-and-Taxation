"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeesApi, tasksApi } from "@/lib/api";
import type { EmployeeStats, Task } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/constants";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Omit<EmployeeStats, "tasks">[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCompleteTask = async (task: Task) => {
    try {
      await tasksApi.update(task._id, { status: "Completed" });
      toast.success("Task marked as completed");
      // Refresh employees list
      const stats = await employeesApi.getAllStats();
      setEmployees(stats);
      // Refresh current employee
      if (selectedEmployee) {
        const detail = await employeesApi.getStats(selectedEmployee.name);
        setSelectedEmployee(detail);
      }
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    try {
      await tasksApi.delete(id);
      toast.success("Task deleted successfully");
      const stats = await employeesApi.getAllStats();
      setEmployees(stats);
      if (selectedEmployee) {
        const detail = await employeesApi.getStats(selectedEmployee.name);
        setSelectedEmployee(detail);
      }
    } catch {
      toast.error("Failed to delete task");
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const stats = await employeesApi.getAllStats();
        setEmployees(stats);
        if (stats.length > 0) {
          const detail = await employeesApi.getStats(stats[0].name);
          setSelectedEmployee(detail);
        }
      } catch {
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const selectEmployee = async (name: string) => {
    try {
      const detail = await employeesApi.getStats(name);
      setSelectedEmployee(detail);
    } catch {
      toast.error("Failed to load employee tasks");
    }
  };

  return (
    <div>
      <Header
        title="Employees"
        subtitle="Track employee workload and performance"
        showClientFilter={false}
      />
      <div className="space-y-6 p-6">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {employees.map((emp) => (
                <Card
                  key={emp.name}
                  className={`cursor-pointer border shadow-sm transition-colors hover:border-blue-300 ${
                    selectedEmployee?.name === emp.name
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-border"
                  }`}
                  onClick={() => selectEmployee(emp.name)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{emp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Assigned</span>
                      <span className="font-medium">{emp.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                      <span>{emp.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                      <span>{emp.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" /> Stuck
                      </span>
                      <span>{emp.stuck}</span>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedEmployee && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  All Assigned Tasks — {selectedEmployee.name}
                </h2>
                {!selectedEmployee.tasks?.length ? (
                  <EmptyState title="No tasks assigned" />
                ) : (
                  <div className="rounded-xl border border-border bg-white shadow-sm dark:bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEmployee.tasks.map((task) => (
                          <TableRow key={task._id}>
                            <TableCell className="text-sm">
                              {task.client === "Pinnacle" || task.client === "Vishnu"
                                ? "—"
                                : task.orderId}
                            </TableCell>
                            <TableCell className="text-sm">{task.client}</TableCell>
                            <TableCell className="text-sm">{task.customerName}</TableCell>
                            <TableCell className="text-sm">{task.plan}</TableCell>
                            <TableCell className="text-sm">{formatCurrency(task.amount)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={task.status} />
                                {task.status !== "Completed" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/50"
                                    onClick={() => handleCompleteTask(task)}
                                    title="Mark Completed"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(task.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                                onClick={() => handleDeleteTask(task._id)}
                                title="Delete Task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
