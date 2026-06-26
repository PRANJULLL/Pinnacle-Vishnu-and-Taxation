export type TaskStatus = "Pending" | "Completed" | "Stuck";

export interface Task {
  _id: string;
  orderId: string;
  client: string;
  customerName: string;
  pan: string;
  phone: string;
  email: string;
  plan: string;
  amount: number;
  taxExpert: string;
  status: TaskStatus;
  remarks?: string;
  createdAt: string;
  completedAt?: string;
  invoiceId?: string;
  reference?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  taskId: string;
  customerName: string;
  amount: number;
  plan: string;
  createdAt: string;
}

export interface Employee {
  _id: string;
  name: string;
}

export interface Client {
  _id: string;
  name: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  completed: number;
  stuck: number;
  todayTasks: number;
  todayCompleted: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ChartData {
  tasksByEmployee: ChartDataPoint[];
  tasksByClient: ChartDataPoint[];
  revenueByClient: ChartDataPoint[];
  statusDistribution: ChartDataPoint[];
  monthlyRevenue: ChartDataPoint[];
}

export interface EmployeeStats {
  name: string;
  total: number;
  pending: number;
  completed: number;
  stuck: number;
  avgCompletionHours: number;
  tasks?: Task[];
}

export interface ReportStats {
  revenue: number;
  completedTasks: number;
  pendingTasks: number;
  stuckTasks: number;
  employeePerformance: {
    name: string;
    total: number;
    completed: number;
    revenue: number;
  }[];
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TaskFilters {
  search?: string;
  client?: string;
  status?: string;
  employee?: string;
  plan?: string;
  dateFilter?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TaskFormData {
  orderId?: string;
  client: string;
  customerName: string;
  pan: string;
  phone: string;
  email: string;
  plan: string;
  amount: number;
  taxExpert: string;
  remarks?: string;
  status?: TaskStatus;
  createdAt?: string;
  reference?: string;
}
