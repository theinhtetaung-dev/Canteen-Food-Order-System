import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { useAuth } from "@user/hooks/useAuth";

export type DayFilterKey = "today" | "yesterday" | "last_7_days" | "last_30_days";

interface HeaderProps {
  selectedDayFilter: DayFilterKey;
  setSelectedDayFilter: (key: DayFilterKey) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedDayFilter, setSelectedDayFilter }) => {
  const { user } = useAuth();
  const [isKitchenOpen, setIsKitchenOpen] = useState(() => {
    const saved = localStorage.getItem("campus_bites_kitchen_status");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const dayDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("campus_bites_kitchen_status", JSON.stringify(isKitchenOpen));
    window.dispatchEvent(new Event("kitchenStatusUpdated"));
  }, [isKitchenOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
        setIsDayDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleKitchen = () => {
    setIsKitchenOpen((prev: boolean) => !prev);
  };

  const dayFilterLabels: Record<DayFilterKey, string> = {
    today: "TODAY",
    yesterday: "YESTERDAY",
    last_7_days: "LAST 7 DAYS",
    last_30_days: "LAST 30 DAYS",
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user?.name || user?.rollNumber || "Canteen Admin"}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tracking student meal requests in real-time.</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Filter Dropdown */}
        <div className="relative" ref={dayDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDayDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>{dayFilterLabels[selectedDayFilter]}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDayDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDayDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-30">
              {(Object.keys(dayFilterLabels) as DayFilterKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedDayFilter(key);
                    setIsDayDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    selectedDayFilter === key
                      ? "bg-[#dcfce7] text-[#15803d]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {dayFilterLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kitchen Status Badge / Toggle */}
        <button
          type="button"
          onClick={toggleKitchen}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isKitchenOpen
              ? "bg-[#dcfce7] text-emerald-800 border border-emerald-200 hover:bg-[#bbf7d0]"
              : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isKitchenOpen ? "bg-emerald-600 animate-pulse" : "bg-red-600 animate-pulse"
            }`}
          />
          <span>{isKitchenOpen ? "KITCHEN: OPEN" : "KITCHEN: CLOSED"}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
