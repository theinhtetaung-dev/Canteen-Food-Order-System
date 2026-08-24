import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, User, UtensilsCrossed, MapPin, ShieldCheck, BarChart3, UserPlus, LogOut, Star, Globe } from 'lucide-react';
import { useAuth } from "@user/hooks/useAuth";
import { fetchAllUsers } from "@user/api/user.api";
import { translate } from "@user/lib/translations";
import brandLogo from "../../../assets/image.png";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [lang, setLang] = useState<"EN" | "MM">(
    (localStorage.getItem("campus_bites_lang") as "EN" | "MM") || "EN"
  );

  const toggleLanguage = () => {
    const newLang = lang === "EN" ? "MM" : "EN";
    setLang(newLang);
    localStorage.setItem("campus_bites_lang", newLang);
    window.dispatchEvent(new Event("languageChanged"));
  };

  useEffect(() => {
    const handleLanguageUpdate = () => {
      const saved = localStorage.getItem("campus_bites_lang") as "EN" | "MM";
      if (saved) {
        setLang(saved);
      }
    };
    window.addEventListener("languageChanged", handleLanguageUpdate);
    window.addEventListener("storage", handleLanguageUpdate);
    return () => {
      window.removeEventListener("languageChanged", handleLanguageUpdate);
      window.removeEventListener("storage", handleLanguageUpdate);
    };
  }, []);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("campus_bites_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || "",
          role: parsed.role || "",
          avatar: parsed.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      fullName: "",
      role: "",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    };
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem("campus_bites_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile({
            fullName: parsed.fullName || "",
            role: parsed.role || "",
            avatar: parsed.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("storage", handleProfileUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleProfileUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const [dbName, setDbName] = useState("");
  const [dbRole, setDbRole] = useState("");

  useEffect(() => {
    async function loadDbUser() {
      if (!user) return;
      try {
        const allUsers = await fetchAllUsers();
        const found = allUsers.find(u => u.userName.toLowerCase() === user.rollNumber.toLowerCase());
        if (found) {
          setDbName(found.fullName || found.userName);
          setDbRole(found.roleName.toLowerCase() === 'superadmin' || found.roleName.toLowerCase() === 'admin'
            ? 'Super Admin' 
            : (found.roleName.toLowerCase() === 'manager' ? 'Canteen Manager' : 'Student'));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDbUser();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const displayName = dbName || user?.name || user?.rollNumber || profile.fullName || "Super Admin";
  const displayRole = dbRole || (user?.role === 'superadmin' ? 'Super Admin' : (user?.role === 'admin' || user?.role === 'manager' ? 'Canteen Manager' : 'Student'));

  function getInitials(name?: string, fallback = "U"): string {
    if (!name) return fallback;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const initials = getInitials(displayName, user?.rollNumber?.slice(0, 2).toUpperCase() ?? "U");

  return (
    <aside className="w-64 bg-[#f4f7ec] border-r border-[#e2e8d5] flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0 font-sans print:hidden">
      <div className="space-y-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-1 bg-[#e2f0c2] rounded-xl shadow-sm overflow-hidden flex items-center justify-center w-11 h-11">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <h1 className="font-black text-lg tracking-tight text-gray-900">Campus</h1>
            <span className="text-[10px] text-[#3B5B11] font-black uppercase tracking-wider block mt-0.5">Bites</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 mt-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            {translate("dashboard", lang)}
          </NavLink>

          <NavLink
            to="/kitchen-admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <Store className="w-4 h-4" />
            {translate("canteenAdmin", lang)}
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <Users className="w-4 h-4" />
            {translate("users", lang)}
          </NavLink>

          <NavLink
            to="/professors"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <UserPlus className="w-4 h-4" />
            {translate("professorAccount", lang)}
          </NavLink>

          <NavLink
            to="/branches"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <MapPin className="w-4 h-4" />
            {translate("canteens", lang)}
          </NavLink>

          <NavLink
            to="/permissions"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4" />
            {translate("permissions", lang)}
          </NavLink>

          <NavLink
            to="/user-reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            {translate("userReports", lang)}
          </NavLink>

          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <Star className="w-4 h-4" />
            {translate("reviews", lang)}
          </NavLink>
        </nav>
      </div>

      {/* Unified Profile Footer */}
      <div className="pt-4 border-t border-[#dce5c7] flex flex-col gap-3 w-full shrink-0">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl p-2 transition-colors ${
              isActive ? "bg-[#e2f0c2]" : "hover:bg-[#ebf3d8]/60"
            }`
          }
        >
          <div className="w-10 h-10 rounded-full bg-[#E1EEB4] flex items-center justify-center text-[#3B5B11] border-2 border-[#88C425] shrink-0 text-xs font-black select-none shadow-sm">
            {initials}
          </div>
          <div className="leading-tight overflow-hidden flex-1">
            <h4 className="text-xs font-black text-gray-900 truncate">
              {displayName}
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 truncate">
              {displayRole}
            </p>
          </div>
        </NavLink>
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold transition-all cursor-pointer border border-gray-200"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{translate("language", lang)}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold transition-all cursor-pointer border border-red-100/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{translate("logout", lang)}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
