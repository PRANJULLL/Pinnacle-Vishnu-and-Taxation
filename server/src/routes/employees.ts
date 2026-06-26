import { Router, Request, Response } from "express";
import Task from "../models/Task";
import Employee from "../models/Employee";
import { applyStuckLogic } from "../services/stuckService";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const employees = await Employee.find().lean();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error });
  }
});

router.get("/:name/stats", async (req: Request, res: Response) => {
  try {
    await applyStuckLogic();
    const name = req.params.name;
    const filter = { taxExpert: name };

    const tasks = await Task.find(filter).lean();
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const stuck = tasks.filter((t) => t.status === "Stuck").length;

    const completedTasks = tasks.filter((t) => t.status === "Completed" && t.completedAt);
    let avgCompletionHours = 0;
    if (completedTasks.length > 0) {
      const totalHours = completedTasks.reduce((sum, t) => {
        const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgCompletionHours = Math.round((totalHours / completedTasks.length) * 10) / 10;
    }

    res.json({ name, total, pending, completed, stuck, avgCompletionHours, tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee stats", error });
  }
});

router.get("/stats/all", async (_req: Request, res: Response) => {
  try {
    await applyStuckLogic();
    const employees = await Employee.find().lean();
    const stats = await Promise.all(
      employees.map(async (emp) => {
        const filter = { taxExpert: emp.name };
        const tasks = await Task.find(filter).lean();
        const completedTasks = tasks.filter((t) => t.status === "Completed" && t.completedAt);
        let avgCompletionHours = 0;
        if (completedTasks.length > 0) {
          const totalHours = completedTasks.reduce((sum, t) => {
            const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
            return sum + diff / (1000 * 60 * 60);
          }, 0);
          avgCompletionHours = Math.round((totalHours / completedTasks.length) * 10) / 10;
        }
        return {
          name: emp.name,
          total: tasks.length,
          pending: tasks.filter((t) => t.status === "Pending").length,
          completed: tasks.filter((t) => t.status === "Completed").length,
          stuck: tasks.filter((t) => t.status === "Stuck").length,
          avgCompletionHours,
        };
      })
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee stats", error });
  }
});

export default router;
