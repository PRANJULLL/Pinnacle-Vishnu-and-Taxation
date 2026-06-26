import axios from "axios";
import type {
  Task,
  TaskFormData,
  TaskFilters,
  TasksResponse,
  DashboardStats,
  ChartData,
  Employee,
  Client,
  Invoice,
  EmployeeStats,
  ReportStats,
} from "./types";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = rawApiUrl.replace(/\/$/, "");
const API_URL = normalizedApiUrl.endsWith("/api") ? normalizedApiUrl : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const tasksApi = {
  getAll: (filters: TaskFilters = {}) =>
    api.get<TasksResponse>("/tasks", { params: filters }).then((r) => r.data),

  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (data: TaskFormData) =>
    api.post<Task>("/tasks", data).then((r) => r.data),

  update: (id: string, data: Partial<TaskFormData>) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
};

export const dashboardApi = {
  getStats: (client?: string) =>
    api
      .get<DashboardStats>("/dashboard/stats", { params: { client } })
      .then((r) => r.data),

  getCharts: (client?: string) =>
    api
      .get<ChartData>("/dashboard/charts", { params: { client } })
      .then((r) => r.data),
};

export const employeesApi = {
  getAll: () => api.get<Employee[]>("/employees").then((r) => r.data),

  getStats: (name: string) =>
    api.get<EmployeeStats>(`/employees/${name}/stats`).then((r) => r.data),

  getAllStats: () =>
    api.get<Omit<EmployeeStats, "tasks">[]>("/employees/stats/all").then((r) => r.data),
};

export const clientsApi = {
  getAll: () => api.get<Client[]>("/clients").then((r) => r.data),
};

export const invoicesApi = {
  getAll: () => api.get<Invoice[]>("/invoices").then((r) => r.data),

  generate: (taskId: string) =>
    api.post<Invoice>(`/invoices/generate/${taskId}`).then((r) => r.data),

  downloadUrl: (invoiceNumber: string) =>
    `${API_URL}/invoices/download/${invoiceNumber}`,
};

export const reportsApi = {
  getStats: () => api.get<ReportStats>("/reports/stats").then((r) => r.data),

  exportExcel: () =>
    `${API_URL}/reports/export/excel`,

  exportPdf: () =>
    `${API_URL}/reports/export/pdf`,
};

export default api;
