import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

const statusStyles: Record<TaskStatus, string> = {
  Pending: "bg-yellow-200/80 text-yellow-900 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
  Completed: "bg-green-200/80 text-green-900 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  Stuck: "bg-red-200/80 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
