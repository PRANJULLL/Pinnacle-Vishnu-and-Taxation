import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
