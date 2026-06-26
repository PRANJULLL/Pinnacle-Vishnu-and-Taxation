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

    let filePath = invoice.pdfPath || getInvoiceFilePath(invoice.invoiceNumber);

    // If the file does not exist on disk, regenerate it
    if (!fs.existsSync(filePath)) {
      const task = await Task.findOne({ invoiceId: invoice._id });
      if (task) {
        filePath = await generateInvoicePDF({
          invoiceNumber: invoice.invoiceNumber,
          customerName: task.customerName,
          amount: task.amount,
          plan: task.plan,
          date: invoice.createdAt || new Date(),
          orderId: task.orderId,
          pan: task.pan,
          phone: task.phone,
          email: task.email,
          client: task.client,
        });

        // Update the pdfPath in database to match current environment's path
        invoice.pdfPath = filePath;
        await invoice.save();
      } else {
        // Fall back to a localized default path guess if Task is not found
        const localPath = getInvoiceFilePath(invoice.invoiceNumber);
        if (fs.existsSync(localPath)) {
          filePath = localPath;
        } else {
          return res.status(404).json({ message: "PDF file not found and associated task not found for regeneration" });
        }
      }
    }

    res.download(filePath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    res.status(500).json({ message: "Failed to download invoice", error });
  }
});

export default router;
