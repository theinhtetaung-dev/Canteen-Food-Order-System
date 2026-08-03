import React from 'react';
import { Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#D1D89D] px-8 py-3 flex items-center justify-between border-b border-black/5">
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

      {/* Search Input Bar */}
      <div className="relative w-80">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-white text-sm py-2 pl-4 pr-10 rounded-full outline-none shadow-sm focus:ring-2 focus:ring-[#8C9A22] text-gray-700 placeholder-gray-400"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Top Header Profile Indicator */}
      <div className="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
          alt="Ta Sone Ta Yout"
          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
        />
        <span className="text-sm font-semibold text-gray-800">Ta Sone Ta Yout</span>
      </div>
    </header>
  );
};