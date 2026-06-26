"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { Task, TaskStatus } from "@/lib/types";
import { useClientFilter } from "@/context/client-filter-context";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/constants";
import { Eye, Pencil, FileText, Trash2, MoreHorizontal, ArrowUpDown, CheckCircle2 } from "lucide-react";

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

interface TaskTableProps {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onGenerateInvoice: (task: Task) => void;
  onComplete?: (task: Task) => void;
  loading?: boolean;
}

export function TaskTable({
  tasks,
  total,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onGenerateInvoice,
  onComplete,
}: TaskTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { selectedClient } = useClientFilter();

  const columns = useMemo<ColumnDef<Task>[]>(
    () => {
      const allCols: ColumnDef<Task>[] = [
        {
          accessorKey: "orderId",
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 text-black dark:text-white hover:text-black dark:hover:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Order ID
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          ),
          cell: ({ row }) => {
            const client = row.original.client;
            if (client === "Pinnacle" || client === "Vishnu") {
              return "—";
            }
            return row.original.orderId;
          },
        },
        { accessorKey: "client", header: "Client" },
        { accessorKey: "customerName", header: "Customer Name" },
        {
          accessorKey: "pan",
          header: "PAN",
          cell: ({ row }) => {
            if (row.original.client === "Clear Tax") {
              return "—";
            }
            return row.original.pan;
          },
        },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "plan", header: "Plan" },
        {
          accessorKey: "amount",
          header: "Amount",
          cell: ({ row }) => formatCurrency(row.original.amount),
        },
        { accessorKey: "taxExpert", header: "Tax Expert" },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
          accessorKey: "createdAt",
          header: "Assigned Date",
          cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
          accessorKey: "remarks",
          header: "Remarks",
          cell: ({ row }) => row.original.remarks || "—",
        },
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const task = row.original;
            return (
              <div className="flex items-center gap-1">
                {task.status !== "Completed" && onComplete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/50"
                    onClick={() => onComplete(task)}
                    title="Mark Completed"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(task)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    {task.status !== "Completed" && onComplete && (
                      <DropdownMenuItem onClick={() => onComplete(task)}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Complete Task
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onGenerateInvoice(task)}>
                      <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteId(task._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          },
        },
      ];

      let cols = [...allCols];

      if (selectedClient === "Pinnacle" || selectedClient === "Vishnu") {
        cols = cols.filter(
          (col) =>
            (col as any).accessorKey !== "orderId" &&
            (col as any).accessorKey !== "plan"
        );
        cols.unshift({
          id: "srNo",
          header: "Sr No",
          cell: ({ row }) => (page - 1) * 10 + row.index + 1,
        });
      } else if (selectedClient === "Clear Tax") {
        cols = cols.filter((col) => (col as any).accessorKey !== "pan");
      }

      return cols;
    },
    [onView, onEdit, onDelete, onGenerateInvoice, onComplete, selectedClient, page]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Try adjusting your filters or add a new task."
      />
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-white shadow-sm dark:bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap text-xs text-black dark:text-white">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const status = row.original.status;
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "transition-colors duration-200",
                      getRowStyles(status)
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-black dark:text-white">
          <p className="text-sm text-black dark:text-white">
            Showing {tasks.length} of {total} tasks
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="text-black dark:text-white hover:bg-muted/50"
            >
              Previous
            </Button>
            <span className="text-sm text-black dark:text-white">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="text-black dark:text-white hover:bg-muted/50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
