import React, { useState, useEffect } from "react";
import { fetchAllOrders, updateOrderStatus } from "@furniture/api/order.api";
import { List, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { fetchAllUsers } from "@furniture/api/user.api";

type OrderStatus = "Pending" | "Preparing" | "Completed" | "Cancelled";

interface Order {
  id: string;
  studentId: string;
  items: string;
  pickupTime: string;
  status: OrderStatus;
  canteenId?: number;
}

export function OrderLists() {
  const { user } = useAuth();
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDbUser() {
      if (!user) return;
      try {
        const allUsers = await fetchAllUsers();
        const found = allUsers.find(u => u.userName.toLowerCase() === user.rollNumber.toLowerCase());
        if (found && found.canteenId) {
          setUserCanteenId(found.canteenId);
        }
      } catch (err) {
        console.error("Failed to load db user in order lists", err);
      }
    }
    loadDbUser();
  }, [user]);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await fetchAllOrders();
      const mapped = data.map((d: any) => {
        // Map backend status to superadmin status
        let mappedStatus: OrderStatus = "Pending";
        if (d.status === "completed") mappedStatus = "Completed";
        if (d.status === "cancelled") mappedStatus = "Cancelled";
        if (d.status === "preparing") mappedStatus = "Preparing";
        
        return {
          id: String(d.id),
          studentId: d.userId,
          items: d.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", "),
          pickupTime: d.pickupTime || "12:00 PM",
          status: mappedStatus,
          canteenId: d.canteenId,
        };
      });
      setOrders(mapped);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const token = localStorage.getItem("canteen_token");
    if (!token) return;

    const apiBaseUrl = import.meta.env.VITE_API_URL || "";
    const eventSource = new EventSource(`${apiBaseUrl}/api/orders/stream?token=${token}`);

    eventSource.addEventListener("new-order", (event) => {
      try {
        const d = JSON.parse(event.data);
        
        let mappedStatus: OrderStatus = "Pending";
        if (d.status === "completed") mappedStatus = "Completed";
        if (d.status === "cancelled") mappedStatus = "Cancelled";
        if (d.status === "preparing") mappedStatus = "Preparing";

        const newOrder: Order = {
          id: String(d.id),
          studentId: d.userId,
          items: d.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", "),
          pickupTime: d.pickupTime || "12:00 PM",
          status: mappedStatus,
          canteenId: d.canteenId,
        };

        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      } catch (err) {
        console.error("Failed to parse real-time order data", err);
      }
    });

    eventSource.onerror = (e) => {
      console.warn("SSE connection encountered an error, closing.", e);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const filteredOrders = React.useMemo(() => {
    if (userCanteenId === null) return orders;
    return orders.filter(o => o.canteenId === userCanteenId);
  }, [orders, userCanteenId]);

  const ORDERS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const visibleOrders = filteredOrders.length >= 10
    ? filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)
    : filteredOrders;

  // Stats Counters
  const activeOrdersCount = filteredOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;
  const readyCount = filteredOrders.filter((o) => o.status === "Preparing").length;
  const completedTodayCount = filteredOrders.filter((o) => o.status === "Completed").length;

  const handleNextStatus = async (id: string, targetBackendStatus: "PREPARING" | "COMPLETE" | "CANCEL") => {
    let nextStatus: OrderStatus = "Pending";
    if (targetBackendStatus === "PREPARING") nextStatus = "Preparing";
    else if (targetBackendStatus === "COMPLETE") nextStatus = "Completed";
    else if (targetBackendStatus === "CANCEL") nextStatus = "Cancelled";

    try {
      await updateOrderStatus(id, targetBackendStatus);
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) return order;
          return { ...order, status: nextStatus };
        })
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
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
      case "Preparing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#b3e5fc] text-[#0277bd]">
            <span className="w-2 h-2 rounded-full bg-[#0288d1]" />
            Preparing
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Cancelled
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
    if (order.status === "Completed" || order.status === "Cancelled") {
      return <span className="text-xs text-gray-400 font-bold">Done</span>;
    }

    const isOpen = openDropdownId === order.id;

    return (
      <div className="relative inline-block text-left">
        <div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdownId(isOpen ? null : order.id);
            }}
            className="inline-flex justify-between items-center gap-1.5 w-28 px-3 py-1.5 bg-[#414b35] hover:bg-[#2d3424] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Actions</span>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenDropdownId(null)}
            />
            <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-[#b8c5a4]/50 shadow-lg py-1 z-20 focus:outline-none">
              {order.status === "Pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleNextStatus(order.id, "PREPARING");
                      setOpenDropdownId(null);
                    }}
                    className="flex w-full items-center px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-[#f6f8f0] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6] mr-2" />
                    Start Prep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleNextStatus(order.id, "CANCEL");
                      setOpenDropdownId(null);
                    }}
                    className="flex w-full items-center px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                    Cancel Order
                  </button>
                </>
              )}
              {order.status === "Preparing" && (
                <button
                  type="button"
                  onClick={() => {
                    handleNextStatus(order.id, "COMPLETE");
                    setOpenDropdownId(null);
                  }}
                  className="flex w-full items-center px-3 py-2 text-[11px] font-bold text-green-700 hover:bg-green-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] mr-2" />
                  Complete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
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
              PREPARING
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
            onClick={loadOrders}
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
                <th className="py-3.5 px-7 w-16">NO</th>
                <th className="py-3.5 px-7">STUDENT ID</th>
                <th className="py-3.5 px-6">ITEMS</th>
                <th className="py-3.5 px-6">PICKUP TIME</th>
                <th className="py-3.5 px-6 text-center">STATUS</th>
                <th className="py-3.5 px-7 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7d8] text-xs font-semibold text-[#3d4235]">
              {visibleOrders.map((order, idx) => {
                const globalIndex = filteredOrders.length >= 10
                  ? (currentPage - 1) * ORDERS_PER_PAGE + idx + 1
                  : idx + 1;
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#f6f8f0] transition-colors"
                  >
                    <td className="py-4 px-7 font-bold text-gray-500 font-mono text-[11px]">
                      {globalIndex}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredOrders.length >= 10 && (
          <div className="p-5 px-7 flex items-center justify-end gap-2 bg-[#fcfdfa]">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-9 h-9 flex items-center justify-center text-[#555555] hover:text-black disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-[14px] text-sm font-black flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? "bg-[#dbebba] text-black"
                    : "bg-[#eaeaea] text-[#8e8e8e] hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-9 h-9 flex items-center justify-center text-[#8e8e8e] hover:text-black disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderLists;