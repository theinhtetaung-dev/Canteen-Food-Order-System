import React, { useState } from "react";
import { List, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

type OrderStatus = "Pending" | "In Progress" | "Ready" | "Completed";

interface Order {
  id: string;
  studentId: string;
  items: string;
  pickupTime: string;
  status: OrderStatus;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "1",
    studentId: "2024-miit-cse-001",
    items: "Burger",
    pickupTime: "11:45 PM",
    status: "Pending",
  },
  {
    id: "2",
    studentId: "2023-miit-cse-002",
    items: "Pizza, Bubble Tea",
    pickupTime: "10:45 PM",
    status: "In Progress",
  },
  {
    id: "3",
    studentId: "2022-miit-ece-004",
    items: "Orange Juice",
    pickupTime: "11:25 PM",
    status: "Pending",
  },
  {
    id: "4",
    studentId: "2019-miit-cse-021",
    items: "Burger",
    pickupTime: "11:00 PM",
    status: "Ready",
  },
];

export function OrderLists() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentPage, setCurrentPage] = useState(1);

  // Stats Counters
  const activeOrdersCount = orders.filter((o) => o.status !== "Completed").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;
  const completedTodayCount = 45;

  const handleNextStatus = (id: string, currentStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        if (currentStatus === "Pending") return { ...order, status: "In Progress" };
        if (currentStatus === "In Progress") return { ...order, status: "Ready" };
        if (currentStatus === "Ready") return { ...order, status: "Completed" };
        return order;
      })
    );
  };

  // Custom Status Badges
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#ffcdd2] text-[#b71c1c]">
            <span className="w-2 h-2 rounded-full bg-[#e53935]" />
            Pending
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#b3e5fc] text-[#0277bd]">
            <span className="w-2 h-2 rounded-full bg-[#0288d1]" />
            In Progress
          </span>
        );
      case "Ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#dbedc7] text-[#33691e]">
            <span className="w-2 h-2 rounded-full bg-[#689f38]" />
            Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-200 text-gray-700">
            Completed
          </span>
        );
    }
  };

  // Action Buttons
  const renderActionButton = (order: Order) => {
    switch (order.status) {
      case "Pending":
        return (
          <button
            type="button"
            onClick={() => handleNextStatus(order.id, order.status)}
            className="w-24 py-1.5 bg-[#f87171] hover:bg-[#ef4444] text-white rounded-md text-xs font-bold transition-colors shadow-sm"
          >
            Start Prep
          </button>
        );
      case "In Progress":
        return (
          <button
            type="button"
            onClick={() => handleNextStatus(order.id, order.status)}
            className="w-24 py-1.5 bg-[#fde047] hover:bg-[#facc15] text-[#422006] rounded-md text-xs font-bold transition-colors shadow-sm"
          >
            Make Ready
          </button>
        );
      case "Ready":
        return (
          <button
            type="button"
            onClick={() => handleNextStatus(order.id, order.status)}
            className="w-24 py-1.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] rounded-md text-xs font-bold transition-colors shadow-sm"
          >
            Complete
          </button>
        );
      default:
        return <span className="text-xs text-gray-400 font-bold">Done</span>;
    }
  };

  return (
    <div className="w-full p-10 space-y-7 bg-[#f6f8f2] min-h-screen text-[#1a1a1a] font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#111111]">
          Today’s Orders
        </h1>
        <p className="text-sm font-semibold text-[#82887a] mt-1.5">
          Manage and process active student lunch orders.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ACTIVE ORDERS */}
        <div className="bg-[#fcfdfa] rounded-[26px] p-6 border border-[#8ba168]/40 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#dbebba] flex items-center justify-center shrink-0">
            <List className="w-7 h-7 text-[#1a1a1a] stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-wider text-[#2d3126] uppercase">
              ACTIVE ORDERS
            </span>
            <div className="text-[42px] font-black text-[#111111] leading-none">
              {activeOrdersCount}
            </div>
          </div>
        </div>

        {/* READY FOR PICKUP */}
        <div className="bg-[#fcfdfa] rounded-[26px] p-6 border border-[#8ba168]/40 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#dbebba] flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7 text-[#1a1a1a]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z" />
              <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
              <line x1="9" y1="5" x2="9" y2="3" />
              <line x1="15" y1="5" x2="15" y2="3" />
              <line x1="8" y1="14" x2="16" y2="14" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-wider text-[#2d3126] uppercase">
              READY FOR PICKUP
            </span>
            <div className="text-[42px] font-black text-[#111111] leading-none">
              {readyCount}
            </div>
          </div>
        </div>

        {/* COMPLETED TODAY */}
        <div className="bg-[#fcfdfa] rounded-[26px] p-6 border border-[#8ba168]/40 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#dbebba] flex items-center justify-center shrink-0">
            <List className="w-7 h-7 text-[#1a1a1a] stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-wider text-[#2d3126] uppercase">
              COMPLETED TODAY
            </span>
            <div className="text-[42px] font-black text-[#111111] leading-none">
              {completedTodayCount}
            </div>
          </div>
        </div>
      </div>

      {/* Active Queue Card */}
      <div className="bg-[#fcfdfa] rounded-[22px] border border-[#b8c5a4] shadow-sm overflow-hidden">
        {/* Header Controls */}
        <div className="p-5 px-7 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">
            Active Queue
          </h2>
          <button
            type="button"
            onClick={() => setOrders(INITIAL_ORDERS)}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#b9c2a8] text-[11px] font-extrabold text-[#2a2e23] uppercase tracking-wider">
                <th className="py-3.5 px-7">STUDENT ID</th>
                <th className="py-3.5 px-6">ITEMS</th>
                <th className="py-3.5 px-6">PICKUP TIME</th>
                <th className="py-3.5 px-6 text-center">STATUS</th>
                <th className="py-3.5 px-7 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7d8] text-xs font-semibold text-[#3d4235]">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#f6f8f0] transition-colors"
                >
                  <td className="py-4 px-7 font-medium text-gray-700">
                    {order.studentId}
                  </td>
                  <td className="py-4 px-6 font-bold text-[#111111]">
                    {order.items}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">
                    {order.pickupTime}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {renderStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-7 text-center">
                    {renderActionButton(order)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-5 px-7 flex items-center justify-end gap-2 bg-[#fcfdfa]">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-9 h-9 flex items-center justify-center text-[#555555] hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`w-9 h-9 rounded-[14px] text-sm font-black flex items-center justify-center transition-colors ${
              currentPage === 1
                ? "bg-[#dbebba] text-black"
                : "bg-[#eaeaea] text-[#8e8e8e] hover:bg-gray-300"
            }`}
          >
            1
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`w-9 h-9 rounded-[14px] text-sm font-bold flex items-center justify-center transition-colors ${
              currentPage === 2
                ? "bg-[#dbebba] text-black font-black"
                : "bg-[#eaeaea] text-[#8e8e8e] hover:bg-gray-300"
            }`}
          >
            2
          </button>

          <span className="text-sm text-[#8e8e8e] font-black px-1.5 tracking-widest">
            ...
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`w-9 h-9 rounded-[14px] text-sm font-bold flex items-center justify-center transition-colors ${
              currentPage === 3
                ? "bg-[#dbebba] text-black font-black"
                : "bg-[#eaeaea] text-[#8e8e8e] hover:bg-gray-300"
            }`}
          >
            3
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            className="w-9 h-9 flex items-center justify-center text-[#8e8e8e] hover:text-black transition-colors"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderLists;