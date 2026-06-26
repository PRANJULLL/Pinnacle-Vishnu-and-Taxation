"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { EMPLOYEES, PLANS, CLIENTS } from "@/lib/constants";
import { Building2, Users, FileText, Palette } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Application preferences and configuration"
        showClientFilter={false}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Clients
            </CardTitle>
            <CardDescription>Configured client organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CLIENTS.filter((c) => c !== "All").map((client) => (
                <span
                  key={client}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm"
                >
                  {client}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Employees
            </CardTitle>
            <CardDescription>Tax experts in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {EMPLOYEES.map((emp) => (
                <span
                  key={emp}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm"
                >
                  {emp}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Plans & Pricing
            </CardTitle>
            <CardDescription>Available filing plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLANS.map((plan) => (
              <div key={plan.value}>
                <div className="flex items-center justify-between text-sm">
                  <span>{plan.label}</span>
                  <span className="font-medium">₹{plan.amount}</span>
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Pinnacle Vishnu and Taxation v1.0.0</p>
            <p className="mt-1">Internal tool for office task and invoice management.</p>
            <p className="mt-1">No authentication required — office computer access only.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
