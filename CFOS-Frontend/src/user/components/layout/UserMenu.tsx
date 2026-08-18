import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@user/hooks/useAuth";

export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <button
          onClick={() => navigate("/login")}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          Log In
        </button>
        <button
          onClick={() => navigate("/register")}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm transition-colors hover:bg-brand-light"
        >
          Register
        </button>
      </div>
    );
  }

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => navigate("/user/profile")}
        className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-brand-dark shadow-sm hover:bg-gray-50 transition-colors"
      >
        <User className="h-4 w-4" />
        {(user.name || user.rollNumber || "User").split(" ")[0]}
      </button>
    </div>
  );
}
