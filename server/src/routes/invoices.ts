import { Router, Request, Response } from "express";
import fs from "fs";
import Invoice from "../models/Invoice";
import Task from "../models/Task";
import {
  generateInvoiceNumber,
  generateInvoicePDF,
  getInvoiceFilePath,
} from "../services/invoiceService";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }).lean();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices", error });
  }
});

router.post("/generate/:taskId", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.invoiceId) {
      const existing = await Invoice.findById(task.invoiceId);
      if (existing) {
        return res.json(existing);
      }
    }

    const invoiceNumber = await generateInvoiceNumber();
    const pdfPath = await generateInvoicePDF({
      invoiceNumber,
      customerName: task.customerName,
      amount: task.amount,
      plan: task.plan,
      date: new Date(),
      orderId: task.orderId,
      pan: task.pan,
      phone: task.phone,
      email: task.email,
      client: task.client,
    });

    const invoice = await Invoice.create({
      invoiceNumber,
      taskId: task._id,
      customerName: task.customerName,
      amount: task.amount,
      plan: task.plan,
      pdfPath,
    });

    task.invoiceId = invoice._id as typeof task.invoiceId;
    await task.save();

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate invoice", error });
  }
});

router.get("/download/:invoiceNumber", async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const filePath = invoice.pdfPath || getInvoiceFilePath(invoice.invoiceNumber);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "PDF file not found" });
    }

    res.download(filePath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    res.status(500).json({ message: "Failed to download invoice", error });
  }
});

export default router;
