import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import { seedDatabase } from "./seed";
import { seedSampleTasks } from "./seedTasks";
import { applyStuckLogic } from "./services/stuckService";
import taskRoutes from "./routes/tasks";
import invoiceRoutes from "./routes/invoices";
import employeeRoutes from "./routes/employees";
import clientRoutes from "./routes/clients";
import dashboardRoutes from "./routes/dashboard";
import reportRoutes from "./routes/reports";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/invoices/files", express.static(path.join(__dirname, "../invoices")));

app.use("/api/tasks", taskRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const start = async () => {
  await connectDB();
  await seedDatabase();
  await seedSampleTasks();

  // Run stuck logic every 15 minutes
  setInterval(applyStuckLogic, 15 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch(console.error);
