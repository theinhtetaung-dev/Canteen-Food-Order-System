import React, { useState, useEffect } from "react";
import { fetchAllOrders, updateOrderStatus } from "@user/api/order.api";
import { List, RefreshCw, ChevronLeft, ChevronRight, Eye, X, LayoutGrid, Clock } from "lucide-react";
import { useAuth } from "@user/hooks/useAuth";
import { fetchAllUsers } from "@user/api/user.api";
import { useSearchParams } from "react-router-dom";

type OrderStatus = "Pending" | "Preparing" | "Completed" | "Cancelled";

interface Order {
  id: string;
  studentId: string;
  items: string;
  rawItems: any[];
  totalAmount: number;
  pickupTime: string;
  status: OrderStatus;
  canteenId?: number;
  createdAt?: string;
  userRole?: string;
}

export function OrderLists() {
  const { user } = useAuth();
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterBox, setFilterBox] = useState<"ALL" | "PENDING" | "PREPARING">("ALL");
  const [viewStyle, setViewStyle] = useState<"card" | "table">("table");
  const [searchParams, setSearchParams] = useSearchParams();
  const targetOrderId = searchParams.get("orderId");

  useEffect(() => {
    if (targetOrderId && orders.length > 0) {
      const cleanTarget = targetOrderId.replace("ORD-", "");
      const found = orders.find(
        (o) =>
          o.id === targetOrderId ||
          o.id === `ORD-${targetOrderId}` ||
          o.id.replace("ORD-", "") === cleanTarget
      );
      if (found) {
        setSelectedOrder(found);
        setSearchParams({}, { replace: true });
      }
    }
  }, [targetOrderId, orders, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBox]);

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

  useEffect(() => {
    const userCanteenPendingIds = orders
      .filter((o) => o.status === "Pending" && (userCanteenId === null || o.canteenId === userCanteenId))
      .map((o) => o.id);

    if (userCanteenPendingIds.length > 0) {
      const saved = localStorage.getItem("campus_bites_watched_orders");
      let watchedList: string[] = [];
      if (saved) {
        try {
          watchedList = JSON.parse(saved);
        } catch (e) {}
      }
      const updated = Array.from(new Set([...watchedList, ...userCanteenPendingIds]));
      localStorage.setItem("campus_bites_watched_orders", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("canteen-orders-updated"));
    }
  }, [orders, userCanteenId]);

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
          rawItems: d.items,
          totalAmount: d.totalAmount || d.totalPrice || d.items.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0),
          pickupTime: d.pickupTime || "12:00 PM",
          status: mappedStatus,
          canteenId: d.canteenId,
          createdAt: d.createdAt,
          userRole: d.userRole,
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
        
        const backendStatus = (d.orderStatus || d.status || "").toLowerCase();
        let mappedStatus: OrderStatus = "Pending";
        if (backendStatus === "completed" || backendStatus === "complete") mappedStatus = "Completed";
        if (backendStatus === "cancelled" || backendStatus === "cancel") mappedStatus = "Cancelled";
        if (backendStatus === "preparing") mappedStatus = "Preparing";

        const rawItemsList = d.orderItems 
          ? d.orderItems.map((i: any) => ({
              menuItemId: i.orderItemId,
              name: i.foodName,
              price: Number(i.snapPrice),
              quantity: i.quantity,
              comment: i.comment,
              image: i.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"
            }))
          : (d.items || []);

        const rawId = String(d.orderId || d.id);
        const newOrder: Order = {
          id: rawId.startsWith("ORD-") ? rawId : `ORD-${rawId}`,
          studentId: d.userName || d.userId,
          items: rawItemsList.map((i: any) => `${i.quantity}x ${i.name}`).join(", "),
          rawItems: rawItemsList,
          totalAmount: d.totalAmount || d.totalPrice || rawItemsList.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0),
          pickupTime: d.pickupTime || "12:00 PM",
          status: mappedStatus,
          canteenId: d.canteenId,
          createdAt: d.createdAt,
          userRole: d.userRole,
        };

        setOrders((prev) => {
          const index = prev.findIndex((o) => o.id === newOrder.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newOrder;
            return updated;
          }
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
    const baseOrders = userCanteenId === null ? orders : orders.filter(o => o.canteenId === userCanteenId);
    // Only display not completed/cancelled orders in the queue
    const activeOrders = baseOrders.filter(o => o.status !== "Completed" && o.status !== "Cancelled");
    return [...activeOrders].sort((a, b) => {
      // FIFO: Oldest orders first
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id.replace(/\\D/g, '')) || 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id.replace(/\\D/g, '')) || 0;
      return timeA - timeB;
    });
  }, [orders, userCanteenId]);

  const ORDERS_PER_PAGE = 10;
  
  const boxFilteredOrders = filteredOrders.filter((o) => {
    if (filterBox === "PENDING") return o.status === "Pending";
    if (filterBox === "PREPARING") return o.status === "Preparing";
    return true;
  });

  const totalPages = Math.ceil(boxFilteredOrders.length / ORDERS_PER_PAGE);
  const visibleOrders = boxFilteredOrders.length >= 10
    ? boxFilteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)
    : boxFilteredOrders;

  // Stats Counters
  const activeOrdersCount = filteredOrders.length;
  const pendingCount = filteredOrders.filter((o) => o.status === "Pending").length;
  const readyCount = filteredOrders.filter((o) => o.status === "Preparing").length;

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
    return (
      <div className="flex items-center justify-center gap-2">
        {order.status !== "Completed" && order.status !== "Cancelled" && (
          <div className="relative inline-block text-left">
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value as "PREPARING" | "COMPLETE" | "CANCEL";
                if (val) handleNextStatus(order.id, val);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#e3f2fd] text-[#1976d2] focus:outline-none cursor-pointer shadow-sm appearance-none pr-8"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231976d2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
            >
              <option value="" disabled hidden>{order.status}</option>
              {order.status === "Pending" && (
                <>
                  <option value="PREPARING">Start Prep</option>
                  <option value="CANCEL">Cancel</option>
                </>
              )}
              {order.status === "Preparing" && (
                <option value="COMPLETE">Complete</option>
              )}
            </select>
          </div>
        )}

        <button 
          onClick={() => setSelectedOrder(order)} 
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#e2e7d8] hover:bg-[#d4dbc8] text-[#414b35] rounded-xl text-xs font-bold transition-all shadow-sm"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Details</span>
        </button>
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
        {/* PENDING ORDERS */}
        <div 
          onClick={() => setFilterBox(filterBox === "PENDING" ? "ALL" : "PENDING")}
          className={`rounded-[26px] p-6 border flex items-center gap-5 shadow-sm cursor-pointer transition-all ${filterBox === "PENDING" ? "bg-[#dbebba] border-[#8ba168]" : "bg-[#fcfdfa] border-[#8ba168]/40 hover:bg-[#f6f8f2]"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
            <List className="w-7 h-7 text-[#1a1a1a] stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-wider text-[#2d3126] uppercase">
              PENDING ORDERS
            </span>
            <div className="text-[42px] font-black text-[#111111] leading-none">
              {pendingCount}
            </div>
          </div>
        </div>

        {/* READY FOR PICKUP */}
        <div 
          onClick={() => setFilterBox(filterBox === "PREPARING" ? "ALL" : "PREPARING")}
          className={`rounded-[26px] p-6 border flex items-center gap-5 shadow-sm cursor-pointer transition-all ${filterBox === "PREPARING" ? "bg-[#dbebba] border-[#8ba168]" : "bg-[#fcfdfa] border-[#8ba168]/40 hover:bg-[#f6f8f2]"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
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

        {/* TOTAL ACTIVE */}
        <div 
          onClick={() => setFilterBox("ALL")}
          className={`rounded-[26px] p-6 border flex items-center gap-5 shadow-sm cursor-pointer transition-all ${filterBox === "ALL" ? "bg-[#dbebba] border-[#8ba168]" : "bg-[#fcfdfa] border-[#8ba168]/40 hover:bg-[#f6f8f2]"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
            <List className="w-7 h-7 text-[#1a1a1a] stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-wider text-[#2d3126] uppercase">
              TOTAL ACTIVE
            </span>
            <div className="text-[42px] font-black text-[#111111] leading-none">
              {activeOrdersCount}
            </div>
          </div>
        </div>
      </div>

      {/* Active Queue Card */}
      <div className="bg-[#fcfdfa] rounded-[22px] border border-[#b8c5a4] shadow-sm overflow-visible">
        {/* Header Controls */}
        <div className="p-5 px-7 flex items-center justify-between border-b border-[#e2e7d8]/60">
          <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">
            Active Queue
          </h2>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-[#eaeaea]/60 rounded-xl p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setViewStyle("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewStyle === "table" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <List className="h-3.5 w-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewStyle("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewStyle === "card" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Card
              </button>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Conditional Rendering of Views */}
        {viewStyle === "table" ? (
          /* Table Container */
          <div className="overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#b9c2a8] text-[11px] font-extrabold text-[#2a2e23] uppercase tracking-wider">
                  <th className="py-3.5 px-7 w-16">NO</th>
                  <th className="py-3.5 px-7">USER</th>
                  <th className="py-3.5 px-6">TOTAL AMOUNT</th>
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
                        <div>
                          <span>{order.studentId}</span>
                          {order.status === "Preparing" && (
                            <div className="mt-2.5 rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-1.5 max-w-xs text-left">
                              <span className="text-[9px] font-black tracking-wider text-blue-700 uppercase block">
                                🍳 Kitchen Prep Details
                              </span>
                              <div className="space-y-1.5">
                                {order.rawItems.map((item: any, i: number) => (
                                  <div key={i} className="flex flex-col text-[11px] font-semibold text-gray-800">
                                    <span>{item.quantity}x {item.name}</span>
                                    {item.comment && (
                                      <span className="text-red-650 text-[9px] font-extrabold bg-red-50 border border-red-100/50 px-1 py-0.5 rounded w-fit mt-0.5">
                                        {item.comment}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#111111]">
                        {order.totalAmount.toLocaleString()} MMK
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-7">
            {visibleOrders.map((order, idx) => {
              const globalIndex = filteredOrders.length >= 10
                ? (currentPage - 1) * ORDERS_PER_PAGE + idx + 1
                : idx + 1;
              return (
                <div
                  key={order.id}
                  className={`group rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between ${
                    order.status === "Preparing"
                      ? "border-blue-100 bg-blue-50/5"
                      : "border-slate-100"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-slate-50 pb-4">
                      <div className="flex items-start gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-extrabold font-mono transition-colors shrink-0 ${
                          order.status === "Preparing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-50 text-slate-500 group-hover:bg-[#e2f0c2] group-hover:text-[#284208]"
                        }`}>
                          {globalIndex}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block leading-tight">
                            {order.studentId}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Pickup: {order.pickupTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {renderStatusBadge(order.status)}
                        <span className="text-xs font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg font-mono">
                          {order.totalAmount.toLocaleString()} MMK
                        </span>
                      </div>
                    </div>

                    {/* Preparing detail box: what is need to cook */}
                    {order.status === "Preparing" && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/35 p-4 space-y-2.5">
                        <span className="text-[10px] font-extrabold tracking-wider text-blue-700 uppercase block text-left">
                          🍳 KITCHEN COOK LIST
                        </span>
                        <div className="space-y-2 text-left">
                          {order.rawItems.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-start text-xs font-semibold">
                              <div className="flex flex-col">
                                <span className="text-gray-800 font-bold">
                                  {item.quantity}x {item.name}
                                </span>
                                {item.comment && (
                                  <span className="text-red-655 text-[10px] font-extrabold mt-0.5 bg-red-50 px-1.5 py-0.5 rounded border border-red-100/50 w-fit">
                                    Note: {item.comment}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-end mt-5 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      {renderActionButton(order)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-5 px-7 flex items-center justify-end gap-2 bg-[#fcfdfa]">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-150 rounded-full shadow-sm text-slate-550 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-center gap-1 bg-white border border-slate-150 rounded-full shadow-sm px-2.5 py-1">
              {(() => {
                const getPaginationRange = (current: number, total: number) => {
                  const range: (number | string)[] = [];
                  if (total <= 7) {
                    for (let i = 1; i <= total; i++) range.push(i);
                    return range;
                  }
                  range.push(1);
                  const start = Math.max(2, current - 1);
                  const end = Math.min(total - 1, current + 1);
                  if (start > 2) {
                    range.push("...");
                  }
                  for (let i = start; i <= end; i++) {
                    range.push(i);
                  }
                  if (end < total - 1) {
                    range.push("...");
                  }
                  range.push(total);
                  return range;
                };

                return getPaginationRange(currentPage, totalPages).map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-xs select-none"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(page))}
                      className={`w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-[#284208] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#284208]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-150 rounded-full shadow-sm text-slate-550 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fbfdf8]">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Order Details</h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{selectedOrder.userRole || "Student"}</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.studentId}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</span>
                <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                  {selectedOrder.rawItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm font-medium py-1">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-bold">{item.name}</span>
                          <span className="text-gray-500 text-xs font-semibold">{item.quantity} x {item.price} MMK</span>
                          {item.comment && (
                            <span className="text-red-600 text-[11px] font-bold mt-0.5">Comment: {item.comment}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-900 font-bold">{((item.price || 0) * (item.quantity || 1)).toLocaleString()} MMK</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                <span className="font-extrabold text-gray-600 uppercase tracking-wider text-sm">Total</span>
                <span className="text-2xl font-black text-[#2a3022]">{selectedOrder.totalAmount.toLocaleString()} MMK</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderLists;
