import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { ProfileForm } from "@furniture/components/auth/ProfileForm";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/furniture");
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <PageContainer>
      <div className="mx-auto max-w-lg mt-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          
          <div className="flex flex-col items-center border-b border-gray-100 bg-gray-50/50 p-8 text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-3xl font-bold text-brand shadow-sm ring-4 ring-white">
              {initials}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              ID: {user.rollNumber}
            </span>
          </div>

          <div className="p-8">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Personal Details</h2>
            <ProfileForm />
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 p-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:text-red-700 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Log Out Securely
            </button>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
