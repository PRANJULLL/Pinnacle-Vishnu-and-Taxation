import Task from "../models/Task";

/** Auto-mark pending tasks older than 24 hours as Stuck */
export const applyStuckLogic = async (): Promise<void> => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await Task.updateMany(
    { status: "Pending", createdAt: { $lt: cutoff } },
    { $set: { status: "Stuck" } }
  );
};

export const applyStuckLogicToTask = (task: {
  status: string;
  createdAt: Date;
}): string => {
  if (task.status !== "Pending") return task.status;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (new Date(task.createdAt) < cutoff) return "Stuck";
  return task.status;
};
