import { Router, Request, Response } from "express";
import Task from "../models/Task";
import { generateOrderId } from "../utils/generateOrderId";
import { PLANS } from "../utils/constants";
import { applyStuckLogic, applyStuckLogicToTask } from "../services/stuckService";

const router = Router();

const buildTaskFilter = (query: Request["query"]) => {
  const filter: Record<string, unknown> = {};

  if (query.client && query.client !== "All") filter.client = query.client;
  if (query.status && query.status !== "All") {
    if (query.status === "Pending") {
      filter.status = { $in: ["Pending", "Stuck"] };
    } else {
      filter.status = query.status;
    }
  }
  if (query.employee && query.employee !== "All") filter.taxExpert = query.employee;
  if (query.plan && query.plan !== "All") {
    const planMap: Record<string, string> = {
      Basic: "Assisted Filing - Basic",
      Premium: "Assisted Filing - Premium",
      Elite: "Assisted Filing - Elite",
    };
    filter.plan = planMap[query.plan as string] || query.plan;
  }

  if (query.search) {
    const search = query.search as string;
    filter.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { pan: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { orderId: { $regex: search, $options: "i" } },
      { taxExpert: { $regex: search, $options: "i" } },
    ];
  }

  if (query.dateFilter) {
    const now = new Date();
    let start: Date;
    if (query.dateFilter === "Today") {
      start = new Date(now.setHours(0, 0, 0, 0));
      filter.createdAt = { $gte: start };
    } else if (query.dateFilter === "This Week") {
      start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start };
    } else if (query.dateFilter === "This Month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.createdAt = { $gte: start };
    }
  }

  return filter;
};

router.get("/", async (req: Request, res: Response) => {
  try {
    await applyStuckLogic();
    const filter = buildTaskFilter(req.query);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    const enriched = tasks.map((t) => ({
      ...t,
      status: applyStuckLogicToTask(t),
    }));

    res.json({ tasks: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ ...task, status: applyStuckLogicToTask(task) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task", error });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { orderId, client, customerName, pan, phone, email, plan, taxExpert, remarks, createdAt, reference } = req.body;
    const amount = PLANS[plan];
    if (amount === undefined) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    let finalOrderId = orderId;
    if (client !== "Clear Tax" || !finalOrderId || finalOrderId.trim() === "") {
      finalOrderId = generateOrderId();
    } else {
      finalOrderId = finalOrderId.trim();
      const existing = await Task.findOne({ orderId: finalOrderId });
      if (existing) {
        return res.status(400).json({ message: `Order ID "${finalOrderId}" already exists` });
      }
    }

    const task = await Task.create({
      orderId: finalOrderId,
      client,
      customerName,
      pan,
      phone,
      email,
      plan,
      amount,
      taxExpert,
      remarks: remarks || "",
      status: "Pending",
      reference: reference || "",
      ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };
    if (updates.plan) {
      updates.amount = PLANS[updates.plan];
    }
    if (updates.createdAt) {
      updates.createdAt = new Date(updates.createdAt);
    }
    if (updates.status === "Completed" && !updates.completedAt) {
      updates.completedAt = new Date();
    }
    if (updates.status === "Pending" || updates.status === "Stuck") {
      updates.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error });
  }
});

export default router;
