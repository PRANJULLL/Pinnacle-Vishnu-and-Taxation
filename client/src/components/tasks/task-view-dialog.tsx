"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Task } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";

interface TaskViewDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (task: Task) => void;
}

export function TaskViewDialog({ task, open, onOpenChange, onComplete }: TaskViewDialogProps) {
  if (!task) return null;

  const fields = [
    { label: "Order ID", value: (task.client === "Pinnacle" || task.client === "Vishnu") ? "—" : task.orderId },
    { label: "Client", value: task.client },
    ...(task.client === "Pinnacle" ? [{ label: "Reference", value: task.reference || "—" }] : []),
    { label: "Customer Name", value: task.customerName },
    { label: "PAN Number", value: task.client === "Clear Tax" ? "—" : task.pan },
    { label: "Phone", value: task.phone },
    { label: "Email", value: task.email },
    { label: "Plan", value: task.plan },
    { label: "Amount", value: formatCurrency(task.amount) },
    { label: "Tax Expert", value: task.taxExpert },
    { label: "Assigned Date", value: formatDate(task.createdAt) },
    { label: "Completed Date", value: task.completedAt ? formatDate(task.completedAt) : "—" },
    { label: "Remarks", value: task.remarks || "—" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Task Details
            <StatusBadge status={task.status} />
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label} className={label === "Remarks" ? "sm:col-span-2" : ""}>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="text-sm">{value}</p>
            </div>
          ))}
        </div>
        {task.status !== "Completed" && onComplete && (
          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onComplete(task);
                onOpenChange(false);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
