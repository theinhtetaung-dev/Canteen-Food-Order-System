import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, UtensilsCrossed } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 bg-[#F2F7E6] flex flex-col justify-between border-r border-gray-200/60 p-4 h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <UtensilsCrossed className="w-7 h-7 text-gray-900" />
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
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
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
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                  : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <Store className="w-4 h-4" />
            Kitchen Admin
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-[#E1EEB4] text-[#3B5B11] font-semibold'
                  : 'text-gray-600 hover:bg-black/5'
              }`
            }
          >
            <Users className="w-4 h-4" />
            Users
          </NavLink>
        </nav>
      </div>

      {/* Admin Profile Footer - Clickable link to /profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `pt-4 border-t border-gray-200/60 flex items-center gap-3 px-1 transition-all rounded-xl hover:opacity-80 ${
            isActive ? 'bg-black/5 p-2' : ''
          }`
        }
      >
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
          alt="Ta Sone Ta Yout Avatar"
          className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm truncate text-gray-900 leading-tight">Ta sone Ta yout</span>
          <span className="text-[11px] text-gray-500 font-medium">Super Admin</span>
        </div>
      </NavLink>
    </aside>
  );
};