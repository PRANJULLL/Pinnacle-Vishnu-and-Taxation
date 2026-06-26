import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Task from "../models/Task";
import { applyStuckLogic } from "./stuckService";

export const getDashboardStats = async (client?: string) => {
  await applyStuckLogic();
  const filter = client && client !== "All" ? { client } : {};

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [total, pending, completed, stuck, todayTasks, todayCompleted] =
    await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "Pending" }),
      Task.countDocuments({ ...filter, status: "Completed" }),
      Task.countDocuments({ ...filter, status: "Stuck" }),
      Task.countDocuments({
        ...filter,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      Task.countDocuments({
        ...filter,
        status: "Completed",
        completedAt: { $gte: todayStart, $lte: todayEnd },
      }),
    ]);

  return { total, pending, completed, stuck, todayTasks, todayCompleted };
};

export const getChartData = async (client?: string) => {
  await applyStuckLogic();
  const match = client && client !== "All" ? { client } : {};

  const tasksByEmployee = await Task.aggregate([
    { $match: match },
    { $group: { _id: "$taxExpert", count: { $sum: 1 } } },
    { $project: { name: "$_id", value: "$count", _id: 0 } },
    { $sort: { value: -1 } },
  ]);

  const tasksByClient = await Task.aggregate([
    { $match: match },
    { $group: { _id: "$client", count: { $sum: 1 } } },
    { $project: { name: "$_id", value: "$count", _id: 0 } },
  ]);

  const revenueByClient = await Task.aggregate([
    { $match: { ...match, status: "Completed" } },
    { $group: { _id: "$client", revenue: { $sum: "$amount" } } },
    { $project: { name: "$_id", value: "$revenue", _id: 0 } },
  ]);

  const statusDistribution = await Task.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { name: "$_id", value: "$count", _id: 0 } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Task.aggregate([
    {
      $match: {
        ...match,
        status: "Completed",
        completedAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$completedAt" },
          month: { $month: "$completedAt" },
        },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        name: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
        value: "$revenue",
        _id: 0,
      },
    },
  ]);

  return {
    tasksByEmployee,
    tasksByClient,
    revenueByClient,
    statusDistribution,
    monthlyRevenue,
  };
};

export const getReportStats = async () => {
  await applyStuckLogic();
  const [revenue, completed, pending, stuck] = await Promise.all([
    Task.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Task.countDocuments({ status: "Completed" }),
    Task.countDocuments({ status: "Pending" }),
    Task.countDocuments({ status: "Stuck" }),
  ]);

  const employeePerformance = await Task.aggregate([
    {
      $group: {
        _id: "$taxExpert",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
        },
        revenue: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        name: "$_id",
        total: 1,
        completed: 1,
        revenue: 1,
        _id: 0,
      },
    },
  ]);

  return {
    revenue: revenue[0]?.total || 0,
    completedTasks: completed,
    pendingTasks: pending,
    stuckTasks: stuck,
    employeePerformance,
  };
};

export const exportTasksExcel = async (): Promise<Buffer> => {
  await applyStuckLogic();
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Tasks");

  sheet.columns = [
    { header: "Order ID", key: "orderId", width: 20 },
    { header: "Client", key: "client", width: 15 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "PAN", key: "pan", width: 15 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Email", key: "email", width: 25 },
    { header: "Plan", key: "plan", width: 25 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Tax Expert", key: "taxExpert", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  tasks.forEach((task) => sheet.addRow(task));
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const exportReportPDF = async (): Promise<Buffer> => {
  const stats = await getReportStats();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#2563eb").text("Office Management Report");
    doc.moveDown();
    doc.fontSize(11).fillColor("#000");
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`);
    doc.moveDown();

    doc.text(`Total Revenue: ₹${stats.revenue.toLocaleString("en-IN")}`);
    doc.text(`Completed Tasks: ${stats.completedTasks}`);
    doc.text(`Pending Tasks: ${stats.pendingTasks}`);
    doc.text(`Stuck Tasks: ${stats.stuckTasks}`);
    doc.moveDown();

    doc.fontSize(14).text("Employee Performance");
    doc.moveDown(0.5);
    stats.employeePerformance.forEach((emp) => {
      doc.fontSize(11).text(
        `${emp.name}: ${emp.completed}/${emp.total} completed | Revenue: ₹${emp.revenue.toLocaleString("en-IN")}`
      );
    });

    doc.end();
  });
};
