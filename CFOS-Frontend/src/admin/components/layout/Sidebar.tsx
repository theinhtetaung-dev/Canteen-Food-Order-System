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
  User,
  Globe,
  History
} from "lucide-react";
import { useAuth } from "@user/hooks/useAuth";
import { fetchAllUsers } from "@user/api/user.api";
import { fetchAllOrders } from "@user/api/order.api";
import { translate } from "@user/lib/translations";

import brandLogo from "../../../assets/logo.png";

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
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
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      if (!user) return;
      try {
        const { api } = await import("@user/api/axios");
        const allUsers = await fetchAllUsers();
        const found = allUsers.find(u => u.userName.toLowerCase() === user.rollNumber.toLowerCase());
        const roleId = found ? found.roleId : (user.role === 'superadmin' ? 1 : 3);
        
        const { data } = await api.get(`/api/rbac/roles/${roleId}/permissions`);
        if (data && data.permissions) {
          const perms = data.permissions.map((p: any) => `${p.menuName}_${p.actionName}`);
          setUserPermissions(perms);
        }
        setPermissionsLoaded(true);
      } catch (err) {
        console.error("Failed to load permissions in sidebar", err);
      }
    }
    loadPermissions();
  }, [user]);

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
            : (found.roleName.toLowerCase() === 'manager' ? 'Canteen Manager' : found.roleName.toLowerCase() === 'professor' ? 'Professor' : 'Student'));
          if (found.canteenId) {
            setUserCanteenId(found.canteenId);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDbUser();
  }, [user]);

  async function loadPendingOrdersCount(canteenId: number | null) {
    try {
      const data = await fetchAllOrders();
      const saved = localStorage.getItem("campus_bites_watched_orders");
      let watchedIds: string[] = [];
      if (saved) {
        try {
          watchedIds = JSON.parse(saved);
        } catch (e) {}
      }

      const pending = data.filter((o) => {
        const isPending = o.status === "pending";
        const matchesCanteen = canteenId === null || o.canteenId === canteenId;
        
        const stringId = String(o.id);
        const prefixedId = stringId.startsWith("ORD-") ? stringId : `ORD-${stringId}`;
        const isNotWatched = !watchedIds.includes(stringId) && !watchedIds.includes(prefixedId);

        return isPending && matchesCanteen && isNotWatched;
      });
      setNewOrdersCount(pending.length);
    } catch (error) {
      console.error("Failed to load pending orders count:", error);
    }
  }

  useEffect(() => {
    loadPendingOrdersCount(userCanteenId);

    const token = localStorage.getItem("canteen_token");
    if (!token) return;

    const apiBaseUrl = import.meta.env.VITE_API_URL || "";
    const eventSource = new EventSource(`${apiBaseUrl}/api/orders/stream?token=${token}`);

    const handleNewOrder = () => {
      loadPendingOrdersCount(userCanteenId);
    };

    eventSource.addEventListener("new-order", handleNewOrder);
    window.addEventListener("canteen-orders-updated", handleNewOrder);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
      window.removeEventListener("canteen-orders-updated", handleNewOrder);
    };
  }, [userCanteenId]);

  const navItems = [
    { label: translate("dashboard", lang), path: "/", icon: LayoutDashboard, permission: "Dashboard_READ" },
    { label: translate("walkinPos", lang), path: "/pos", icon: UtensilsCrossed, permission: "Orders & POS_READ" },
    { label: translate("ordersManagement", lang), path: "/orders", icon: ShoppingBag, permission: "Orders & POS_READ" },
    { label: translate("orderHistory", lang), path: "/orders-history", icon: History, permission: "Orders & POS_READ" },
    { label: translate("menuItems", lang), path: "/menu", icon: Utensils, permission: "Food Category & Menu_READ" },
    { label: translate("categories", lang), path: "/categories", icon: Layers, permission: "Food Category & Menu_READ" },
    { label: translate("reports", lang), path: "/reports", icon: BarChart3, permission: "Orders & POS_READ" },
  ].filter(item => {
    if (user?.role === 'superadmin') return true;
    if (!permissionsLoaded) return true;
    return userPermissions.includes(item.permission);
  });

  const handleLogout = () => {
    logout();
  };

  const displayName = dbName || user?.name || user?.rollNumber || profile.fullName || "Canteen Manager";
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
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#e2f0c2] text-[#284208] shadow-sm"
                      : "text-gray-600 hover:bg-[#ebf3d8] hover:text-gray-900"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                  <span>{item.label}</span>
                </div>
                {item.path === "/orders" && newOrdersCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                    {newOrdersCount}
                  </span>
                )}
              </NavLink>
            );
          })}
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
}

export default Sidebar;
