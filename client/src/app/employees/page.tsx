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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { employeesApi, tasksApi, invoicesApi } from "@/lib/api";
import type { EmployeeStats, Task, TaskStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/constants";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertTriangle, Eye, Pencil, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskViewDialog } from "@/components/tasks/task-view-dialog";

const getRowStyles = (status: TaskStatus): string => {
  switch (status) {
    case "Completed":
      return "bg-green-200/60 hover:bg-green-200/80 dark:bg-green-950/40 dark:hover:bg-green-950/60 text-black dark:text-white border-b border-green-300/60 dark:border-green-900/50";
    case "Pending":
      return "bg-yellow-200/60 hover:bg-yellow-200/80 dark:bg-yellow-950/40 dark:hover:bg-yellow-950/60 text-black dark:text-white border-b border-yellow-300/60 dark:border-yellow-900/50";
    case "Stuck":
      return "bg-red-200/60 hover:bg-red-200/80 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-black dark:text-white border-b border-red-300/60 dark:border-red-900/50";
    default:
      return "hover:bg-muted/50 border-b border-border text-black dark:text-white";
  }
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Omit<EmployeeStats, "tasks">[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);

  // View / Edit dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Client tasks filter state
  const [clientFilter, setClientFilter] = useState<"All" | "Pinnacle_Vishnu" | "ClearTax">("All");

  const filteredTasks = selectedEmployee?.tasks?.filter((task) => {
    if (clientFilter === "Pinnacle_Vishnu") {
      return task.client === "Pinnacle" || task.client === "Vishnu";
    }
    if (clientFilter === "ClearTax") {
      return task.client === "Clear Tax";
    }
    return true;
  }) || [];

  const refreshData = async () => {
    try {
      const stats = await employeesApi.getAllStats();
      setEmployees(stats);
      if (selectedEmployee) {
        const detail = await employeesApi.getStats(selectedEmployee.name);
        setSelectedEmployee(detail);
      }
    } catch {
      toast.error("Failed to refresh employee data");
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await tasksApi.update(task._id, { status: "Completed" });
      toast.success("Task marked as completed");
      await refreshData();
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await tasksApi.update(selectedTask._id, data);
      toast.success("Task updated successfully");
      await refreshData();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = async (task: Task) => {
    try {
      const invoice = await invoicesApi.generate(task._id);
      toast.success(`Invoice ${invoice.invoiceNumber} generated`);
      window.open(invoicesApi.downloadUrl(invoice.invoiceNumber), "_blank");
      await refreshData();
    } catch {
      toast.error("Failed to generate invoice");
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
        title="Task Experts"
        subtitle="Track expert workload and performance"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <h2 className="text-lg font-semibold">
                    All Assigned Tasks — {selectedEmployee.name}
                  </h2>
                  {(selectedEmployee.tasks?.length ?? 0) > 0 && (
                    <div className="flex border-b border-border sm:border-none">
                      <button
                        onClick={() => setClientFilter("All")}
                        className={cn(
                          "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                          clientFilter === "All"
                            ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setClientFilter("Pinnacle_Vishnu")}
                        className={cn(
                          "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                          clientFilter === "Pinnacle_Vishnu"
                            ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Pinnacle & Vishnu
                      </button>
                      <button
                        onClick={() => setClientFilter("ClearTax")}
                        className={cn(
                          "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                          clientFilter === "ClearTax"
                            ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Clear Tax
                      </button>
                    </div>
                  )}
                </div>

                {!selectedEmployee.tasks?.length ? (
                  <EmptyState title="No tasks assigned" />
                ) : filteredTasks.length === 0 ? (
                  <EmptyState title="No tasks found matching this filter" />
                ) : (
                  <div className="rounded-xl border border-border bg-white shadow-sm dark:bg-card">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>PAN</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned Date</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTasks.map((task) => (
                            <TableRow
                              key={task._id}
                              className={cn(
                                "transition-colors duration-200",
                                getRowStyles(task.status)
                              )}
                            >
                              <TableCell className="text-sm">
                                {task.client === "Pinnacle" || task.client === "Vishnu"
                                  ? "—"
                                  : task.orderId}
                              </TableCell>
                              <TableCell className="text-sm">{task.client}</TableCell>
                              <TableCell className="text-sm">{task.customerName}</TableCell>
                              <TableCell className="text-sm">
                                {task.client === "Clear Tax" ? "—" : task.pan}
                              </TableCell>
                              <TableCell className="text-sm">{task.phone}</TableCell>
                              <TableCell className="text-sm">{task.email}</TableCell>
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
                              <TableCell className="text-sm">{task.remarks || "—"}</TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-1">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedTask(task);
                                        setViewOpen(true);
                                      }}>
                                        <Eye className="mr-2 h-4 w-4" /> View
                                      </DropdownMenuItem>
                                      {task.status !== "Completed" && (
                                        <DropdownMenuItem onClick={() => handleCompleteTask(task)}>
                                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Complete Task
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedTask(task);
                                        setFormOpen(true);
                                      }}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleGenerateInvoice(task)}>
                                        <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={selectedTask}
        onSubmit={handleUpdateTask}
        loading={submitting}
      />

      <TaskViewDialog
        task={selectedTask}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onComplete={handleCompleteTask}
      />
    </div>
  );
}
