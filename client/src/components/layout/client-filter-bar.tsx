"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CLIENTS } from "@/lib/constants";
import { useClientFilter } from "@/context/client-filter-context";
import { cn } from "@/lib/utils";

export function ClientFilterBar() {
  const { selectedClient, setSelectedClient } = useClientFilter();
  const pathname = usePathname();
  const isTasksPage = pathname === "/tasks";

  const clientsToShow = isTasksPage
    ? CLIENTS.filter((c) => c !== "All")
    : CLIENTS;

  useEffect(() => {
    if (isTasksPage && selectedClient === "All") {
      setSelectedClient("Pinnacle");
    }
  }, [isTasksPage, selectedClient, setSelectedClient]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Client:</span>
      <div className="flex flex-wrap gap-2">
        {clientsToShow.map((client) => (
          <button
            key={client}
            onClick={() => setSelectedClient(client)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              selectedClient === client
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-border bg-white text-muted-foreground hover:border-blue-300 hover:text-foreground dark:bg-card"
            )}
          >
            {client}
          </button>
        ))}
      </div>
    </div>
  );
}
