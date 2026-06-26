"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Header } from "@/components/layout/header";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoicesApi } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/constants";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await invoicesApi.getAll();
        setInvoices(data);
      } catch {
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div>
      <Header
        title="Invoices"
        subtitle="View and download generated invoices"
        showClientFilter={false}
      />
      <div className="p-6">
        {loading ? (
          <TableSkeleton />
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Generate invoices from the Tasks page using the Generate Invoice action."
          />
        ) : (
          <div className="rounded-xl border border-border bg-white shadow-sm dark:bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{invoice.plan}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            invoicesApi.downloadUrl(invoice.invoiceNumber),
                            "_blank"
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} generated
          </div>
        )}
      </div>
    </div>
  );
}
