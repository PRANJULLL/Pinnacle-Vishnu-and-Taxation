"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-4 dark:bg-red-950">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again or return to the dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
