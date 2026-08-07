import React, { useState, useRef, useEffect } from "react";
import { Header, type DayFilterKey } from "../components/layout/Header";
import { Calendar, ChevronDown } from "lucide-react";
import { fetchReport, type ReportResponseModel } from "@furniture/api/report.api";

type TimeRangeKey = "weekly" | "monthly" | "last_6_months" | "last_year";

interface ChartDataSet {
  labels: string[];
  points: { x: number; y: number }[];
  growthText: string;
}

interface DashboardMetrics {
  totalOrders: string;
  averageRating: string;
  totalRevenue: string;
}

export const Dashboard = () => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayFilterKey>("today");
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>("last_6_months");
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const chartDropdownRef = useRef<HTMLDivElement>(null);

  const [currentMetrics, setCurrentMetrics] = useState<DashboardMetrics>({
    totalOrders: "0",
    averageRating: "4.8",
    totalRevenue: "MMK 0",
  });
  
  const [currentDataset, setCurrentDataset] = useState<ChartDataSet>({
    labels: [],
    points: [],
    growthText: "",
  });

  // Calculate Dates for Day Filter
  const getDatesForFilter = (filter: DayFilterKey) => {
    const end = new Date();
    const start = new Date();
    if (filter === "yesterday") {
      start.setDate(end.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (filter === "last_7_days") {
      start.setDate(end.getDate() - 7);
    } else if (filter === "last_30_days") {
      start.setDate(end.getDate() - 30);
    }
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    async function loadMetrics() {
      try {
        const { startDate, endDate } = getDatesForFilter(selectedDayFilter);
        const data = await fetchReport("daily", startDate, endDate);
        setCurrentMetrics({
          totalOrders: data.totalOrders.toLocaleString(),
          averageRating: "4.8", // Mocked as no endpoint
          totalRevenue: `MMK ${data.totalRevenue.toLocaleString()}`,
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      }
    }
    loadMetrics();
  }, [selectedDayFilter]);

  // Calculate Dates for Range Filter
  const getDatesForRange = (range: TimeRangeKey) => {
    const end = new Date();
    const start = new Date();
    let type = "daily";
    if (range === "weekly") {
      start.setDate(end.getDate() - 7);
    } else if (range === "monthly") {
      start.setDate(end.getDate() - 30);
    } else if (range === "last_6_months") {
      start.setMonth(end.getMonth() - 6);
      type = "monthly";
    } else if (range === "last_year") {
      start.setFullYear(end.getFullYear() - 1);
      type = "monthly";
    }
    return {
      type,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    async function loadChart() {
      try {
        const { type, startDate, endDate } = getDatesForRange(selectedRange);
        const data = await fetchReport(type, startDate, endDate);
        
        // Map to SVG coordinates
        const labels = data.periodBreakdown.map(p => p.periodLabel.substring(0, 5));
        const maxOrder = Math.max(...data.periodBreakdown.map(p => p.orderCount), 1);
        
        const points = data.periodBreakdown.map((p, i) => {
          const x = 40 + (i * (420 / Math.max(labels.length - 1, 1)));
          const y = 120 - ((p.orderCount / maxOrder) * 80);
          return { x, y };
        });

        setCurrentDataset({
          labels,
          points: points.length > 0 ? points : [{ x: 40, y: 115 }],
          growthText: "Live Data",
        });
      } catch (err) {
        console.error("Failed to load chart", err);
      }
    }
    loadChart();
  }, [selectedRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target as Node)) {
        setIsChartDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rangeLabels: Record<TimeRangeKey, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    last_6_months: "Last 6 Months",
    last_year: "Last Year",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header 
        selectedDayFilter={selectedDayFilter} 
        setSelectedDayFilter={setSelectedDayFilter} 
      />

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-5">
            <svg className="w-36 h-36 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0 relative z-10">
            <svg className="w-5 h-5 text-[#059669]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Total Orders</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1 transition-all">{currentMetrics.totalOrders}</p>
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-5">
            <svg className="w-36 h-36 text-emerald-900 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0 relative z-10">
            <svg className="w-5 h-5 text-[#059669] fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Average Rating</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1 transition-all">{currentMetrics.averageRating}</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-5">
            <svg className="w-36 h-36 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0 relative z-10">
            <svg className="w-5 h-5 text-[#059669]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Total Revenue</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1 transition-all">{currentMetrics.totalRevenue}</p>
          </div>
        </div>

      </div>

      {/* Customer Growth Section */}
      <div className="bg-white rounded-2xl border border-gray-200/70 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Customer Growth</h2>
            <span className="bg-[#dcfce7] text-[#15803d] text-xs font-bold px-2.5 py-1 rounded-full transition-all">
              {currentDataset.growthText}
            </span>
          </div>

          <div className="relative" ref={chartDropdownRef}>
            <button
              type="button"
              onClick={() => setIsChartDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{rangeLabels[selectedRange]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isChartDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isChartDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20">
                {(Object.keys(rangeLabels) as TimeRangeKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedRange(key);
                      setIsChartDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                      selectedRange === key ? "bg-[#dcfce7] text-[#15803d]" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {rangeLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart Body */}
        <div className="pt-8 pb-4">
          <div className="relative w-full h-56">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100 w-full" />
            </div>

            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <path
                d={currentDataset.points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "")}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              {currentDataset.points.map((pt, idx) => (
                <circle key={idx} cx={pt.x} cy={pt.y} r="4" className="fill-[#047857] transition-all duration-300" />
              ))}
            </svg>
          </div>

          <div
            className="grid text-center text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider"
            style={{ gridTemplateColumns: `repeat(${currentDataset.labels.length}, minmax(0, 1fr))` }}
          >
            {currentDataset.labels.map((label, index) => (
              <span key={index} className="transition-all duration-300">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;