import { Link } from "react-router-dom";
import { Home, UtensilsCrossed } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
        <UtensilsCrossed className="h-10 w-10 text-brand" />
      </div>
      <h1 className="text-6xl font-bold text-brand">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="mt-3 max-w-md text-gray-500">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
