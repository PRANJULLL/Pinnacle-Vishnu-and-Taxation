export const CLIENTS = ["All", "Pinnacle", "Vishnu", "Clear Tax"] as const;

export const EMPLOYEES = ["Jay", "Mohan", "Prem", "Vivek"] as const;

export const PLANS = [
  { label: "Basic", value: "Basic", amount: 500 },
  { label: "Elite", value: "Elite", amount: 1800 },
  { label: "Premium", value: "Premium", amount: 1300 },
] as const;

export const STATUSES = ["All", "Pending", "Completed", "Stuck"] as const;

export const PLAN_FILTERS = ["All", "Basic", "Premium", "Elite"] as const;

export const DATE_FILTERS = ["All", "Today", "This Week", "This Month"] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/tasks", label: "Tasks", icon: "CheckSquare" },
  { href: "/employees", label: "Task Experts", icon: "Users" },
  { href: "/invoices", label: "Invoices", icon: "FileText" },
  { href: "/reports", label: "Reports", icon: "BarChart3" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

export const getPlanAmount = (plan: string): number => {
  return PLANS.find((p) => p.value === plan)?.amount ?? 0;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
};
