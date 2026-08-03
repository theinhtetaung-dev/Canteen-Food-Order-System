import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Package, User } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { cn } from "@furniture/lib/utils";

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link
          to="/login"
          className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          Log In
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm transition-colors hover:bg-brand-light"
        >
          Register
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-brand-dark shadow-sm"
      >
        <User className="h-4 w-4" />
        {user.name.split(" ")[0]}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-brand" />
              Profile
            </Link>
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Package className="h-4 w-4 text-brand" />
              My Orders
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
