import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClientFilterProvider } from "@/context/client-filter-context";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pinnacle Vishnu and Taxation",
  description: "Internal office management tool for Chartered Accountant firm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ThemeProvider>
          <ClientFilterProvider>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="top-right" />
          </ClientFilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
