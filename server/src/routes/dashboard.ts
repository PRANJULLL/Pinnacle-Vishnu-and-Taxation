import { Router, Request, Response } from "express";
import { getDashboardStats, getChartData } from "../services/reportService";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const client = req.query.client as string;
    const stats = await getDashboardStats(client);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", error });
  }
});

router.get("/charts", async (req: Request, res: Response) => {
  try {
    const client = req.query.client as string;
    const charts = await getChartData(client);
    res.json(charts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chart data", error });
  }
});

export default router;
