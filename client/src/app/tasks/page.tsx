"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskFiltersBar } from "@/components/tasks/task-filters";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskViewDialog } from "@/components/tasks/task-view-dialog";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useClientFilter } from "@/context/client-filter-context";
import { tasksApi, invoicesApi } from "@/lib/api";
import type { Task, TaskFilters, TaskFormData } from "@/lib/types";
import { toast } from "sonner";

export default function TasksPage() {
  const { selectedClient } = useClientFilter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getAll({
        ...filters,
        search: search || undefined,
        client: selectedClient !== "All" ? selectedClient : undefined,
        page,
        limit: 10,
      });
      setTasks(data.tasks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters, search, selectedClient, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [selectedClient, filters, search]);

  const handleCreate = async (data: TaskFormData) => {
    setSubmitting(true);
    try {
      await tasksApi.create(data);
      toast.success("Task assigned successfully");
      fetchTasks();
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create task";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: TaskFormData) => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await tasksApi.update(selectedTask._id, data);
      toast.success("Task updated successfully");
      fetchTasks();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.delete(id);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleGenerateInvoice = async (task: Task) => {
    try {
      const invoice = await invoicesApi.generate(task._id);
      toast.success(`Invoice ${invoice.invoiceNumber} generated`);
      window.open(invoicesApi.downloadUrl(invoice.invoiceNumber), "_blank");
      fetchTasks();
    } catch {
      toast.error("Failed to generate invoice");
    }
  };

  const handleComplete = async (task: Task) => {
    try {
      await tasksApi.update(task._id, { status: "Completed" });
      toast.success("Task marked as completed");
      fetchTasks();
    } catch {
      toast.error("Failed to complete task");
    }
  };

  return (
    <div>
      <Header
        title="Tasks"
        subtitle="Manage all filing tasks and assignments"
        search={search}
        onSearchChange={setSearch}
        showClientFilter
        actions={
          <Button
            onClick={() => {
              setSelectedTask(null);
              setFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <TaskFiltersBar filters={filters} onChange={setFilters} />
        {loading ? (
          <TableSkeleton />
        ) : (
          <TaskTable
            tasks={tasks}
            total={total}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onView={(task) => {
              setSelectedTask(task);
              setViewOpen(true);
            }}
            onEdit={(task) => {
              setSelectedTask(task);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
            onGenerateInvoice={handleGenerateInvoice}
            onComplete={handleComplete}
          />
        )}
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={selectedTask}
        onSubmit={selectedTask ? handleUpdate : handleCreate}
        loading={submitting}
      />
      <TaskViewDialog
        task={selectedTask}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onComplete={handleComplete}
      />
    </div>
  );
}
