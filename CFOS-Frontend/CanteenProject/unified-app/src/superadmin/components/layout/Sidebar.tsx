import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListOrdered,
  UtensilsCrossed,
  MessageSquare,
} from "lucide-react";

import vegetarianLogo from "../../assets/vegetarian-food.svg";

export function Sidebar() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("campus_bites_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      fullName: "kaung thant",
      role: "Super Admin",
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
            fullName: parsed.fullName || "kaung thant",
            role: parsed.role || "Super Admin",
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

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Order Lists", path: "/orders", icon: ListOrdered },
    { label: "Menu", path: "/menu", icon: UtensilsCrossed },
    { label: "Reviews", path: "/reviews", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-[#f4f7ec] border-r border-[#e2e8d5] flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0 font-sans">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <img
            src={vegetarianLogo}
            alt="Campus Bites Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="leading-tight">
            <h1 className="text-xl font-extrabold text-[#1c2e0a] tracking-tight">
              Campus
            </h1>
            <h1 className="text-xl font-extrabold text-[#1c2e0a] tracking-tight -mt-1">
              Bites
            </h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#e2f0c2] text-[#284208]"
                      : "text-gray-700 hover:bg-[#ebf3d8] hover:text-gray-900"
                  }`
                }
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center gap-3 pt-4 border-t border-[#dce5c7] rounded-xl p-2 transition-colors ${
            isActive ? "bg-[#e2f0c2]/60" : "hover:bg-[#ebf3d8]/60"
          }`
        }
      >
        <img
          src={profile.avatar}
          alt={profile.fullName}
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
        />
        <div className="leading-tight overflow-hidden">
          <h4 className="text-xs font-extrabold text-gray-900 truncate">
            {profile.fullName}
          </h4>
          <p className="text-[11px] text-gray-500 font-medium truncate">
            {profile.role}
          </p>
        </div>
      </NavLink>
    </aside>
  );
}

export default Sidebar;