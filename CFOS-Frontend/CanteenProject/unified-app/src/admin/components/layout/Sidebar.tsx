import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, User, UtensilsCrossed, MapPin, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from "@furniture/hooks/useAuth";
import brandLogo from "../../../assets/image.png";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="w-60 bg-[#F2F7E6] flex flex-col justify-between border-r border-gray-200/60 p-4 h-screen sticky top-0 shrink-0 print:hidden">
      <div>
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-200">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-none text-gray-900 tracking-tight">Campus</h1>
            <span className="font-extrabold text-xl leading-none text-gray-900 tracking-tight">Bites</span>
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
            Dashboard
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
            Canteen Admin
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
            Users
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
            Canteens
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
            Permissions
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
            User Reports
          </NavLink>
        </nav>
      </div>

      {/* Admin Profile Footer - Clickable link to /profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `pt-4 border-t border-gray-200/60 flex items-center gap-3 px-1 transition-all rounded-xl hover:opacity-80 ${isActive ? 'bg-black/5 p-2' : ''
          }`
        }
      >
        <div className="w-10 h-10 rounded-full bg-[#E1EEB4] flex items-center justify-center text-[#3B5B11] border border-white shadow-sm shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm truncate text-gray-900 leading-tight">
            {user?.name || user?.rollNumber || 'Super Admin'}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">Super Admin</span>
        </div>
      </NavLink>
    </aside>
  );
};