import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Layers,
  MapPin,
  BarChart3,
  LogOut,
  UtensilsCrossed,
  User
} from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { fetchAllUsers } from "@furniture/api/user.api";

import brandLogo from "../../../assets/logo.png";

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
          setDbRole(found.roleName.toLowerCase() === 'superadmin' 
            ? 'Super Admin' 
            : (found.roleName.toLowerCase() === 'manager' ? 'Canteen Manager' : 'Student'));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDbUser();
  }, [user]);

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Walk-in POS", path: "/pos", icon: UtensilsCrossed },
    { label: "Orders Management", path: "/orders", icon: ShoppingBag },
    { label: "Menu Items", path: "/menu", icon: Utensils },
    { label: "Categories", path: "/categories", icon: Layers },
    { label: "Reports", path: "/reports", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
  };

  const displayName = dbName || user?.name || user?.rollNumber || profile.fullName || "Canteen Manager";
  const displayRole = dbRole || (user?.role === 'superadmin' ? 'Super Admin' : (user?.role === 'admin' || user?.role === 'manager' ? 'Canteen Manager' : 'Student'));

  return (
    <aside className="w-64 bg-[#f4f7ec] border-r border-[#e2e8d5] flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0 font-sans">
      <div className="space-y-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-1 bg-[#e2f0c2] rounded-xl shadow-sm overflow-hidden flex items-center justify-center w-11 h-11">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-black text-[#1c2e0a] tracking-tight">
              MIIT Canteen
            </h1>
            <span className="text-[10px] text-[#5b7a42] uppercase font-bold tracking-wider block mt-0.5">
              Campus Bites
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#e2f0c2] text-[#284208] shadow-sm"
                      : "text-gray-600 hover:bg-[#ebf3d8] hover:text-gray-900"
                  }`
                }
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="pt-4 border-t border-[#dce5c7] flex flex-col gap-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl p-2 transition-colors ${
              isActive ? "bg-[#e2f0c2]/60" : "hover:bg-[#ebf3d8]/60"
            }`
          }
        >
          <div className="w-10 h-10 rounded-full bg-[#dbebba] border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
            <User className="w-5 h-5 text-[#3f5d13]" strokeWidth={2.5} />
          </div>
          <div className="leading-tight overflow-hidden">
            <h4 className="text-xs font-black text-gray-900 truncate">
              {displayName}
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 truncate">
              {displayRole}
            </p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold transition-all cursor-pointer border border-red-100/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;