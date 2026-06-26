import { Router, Request, Response } from "express";
import {
  getReportStats,
  exportTasksExcel,
  exportReportPDF,
} from "../services/reportService";

const router = Router();

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await getReportStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch report stats", error });
  }
});

router.get("/export/excel", async (_req: Request, res: Response) => {
  try {
    const buffer = await exportTasksExcel();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=tasks-export.xlsx");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Failed to export Excel", error });
  }
});

router.get("/export/pdf", async (_req: Request, res: Response) => {
  try {
    const buffer = await exportReportPDF();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Failed to export PDF", error });
  }
});

export default router;
