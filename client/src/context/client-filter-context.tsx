"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ClientFilterContextType {
  selectedClient: string;
  setSelectedClient: (client: string) => void;
}

const ClientFilterContext = createContext<ClientFilterContextType>({
  selectedClient: "All",
  setSelectedClient: () => {},
});

export function ClientFilterProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState("All");

  return (
    <ClientFilterContext.Provider value={{ selectedClient, setSelectedClient }}>
      {children}
    </ClientFilterContext.Provider>
  );
}

export const useClientFilter = () => useContext(ClientFilterContext);
