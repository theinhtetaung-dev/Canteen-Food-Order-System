import React, { useState, useEffect } from "react";
import { fetchAllOrders, updateOrderStatus } from "@furniture/api/order.api";
import { List, RefreshCw, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { fetchAllUsers } from "@furniture/api/user.api";

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
}

export function OrderLists() {
  const { user } = useAuth();
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterBox, setFilterBox] = useState<"ALL" | "ACTIVE" | "PREPARING" | "COMPLETED">("ALL");

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
          rawItems: d.items,
          totalAmount: d.totalAmount || d.totalPrice || d.items.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 1)), 0),
          pickupTime: d.pickupTime || "12:00 PM",
          status: mappedStatus,
          canteenId: d.canteenId,
          createdAt: d.createdAt,
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
    return [...baseOrders].sort((a, b) => {
      // Push Completed/Cancelled to the bottom
      const aDone = a.status === "Completed" || a.status === "Cancelled" ? 1 : 0;
      const bDone = b.status === "Completed" || b.status === "Cancelled" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      
      // FIFO: Oldest orders first
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id.replace(/\\D/g, '')) || 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id.replace(/\\D/g, '')) || 0;
      return timeA - timeB;
    });
  }, [orders, userCanteenId]);

  const ORDERS_PER_PAGE = 10;
  
  const boxFilteredOrders = filteredOrders.filter((o) => {
    if (filterBox === "ACTIVE") return o.status !== "Completed" && o.status !== "Cancelled";
    if (filterBox === "PREPARING") return o.status === "Preparing";
    if (filterBox === "COMPLETED") return o.status === "Completed";
    return true;
  });

  const totalPages = Math.ceil(boxFilteredOrders.length / ORDERS_PER_PAGE);
  const visibleOrders = boxFilteredOrders.length >= 10
    ? boxFilteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)
    : boxFilteredOrders;

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
        {/* ACTIVE ORDERS */}
        <div 
          onClick={() => setFilterBox(filterBox === "ACTIVE" ? "ALL" : "ACTIVE")}
          className={`rounded-[26px] p-6 border flex items-center gap-5 shadow-sm cursor-pointer transition-all ${filterBox === "ACTIVE" ? "bg-[#dbebba] border-[#8ba168]" : "bg-[#fcfdfa] border-[#8ba168]/40 hover:bg-[#f6f8f2]"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
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

        {/* COMPLETED TODAY */}
        <div 
          onClick={() => setFilterBox(filterBox === "COMPLETED" ? "ALL" : "COMPLETED")}
          className={`rounded-[26px] p-6 border flex items-center gap-5 shadow-sm cursor-pointer transition-all ${filterBox === "COMPLETED" ? "bg-[#dbebba] border-[#8ba168]" : "bg-[#fcfdfa] border-[#8ba168]/40 hover:bg-[#f6f8f2]"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
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
      <div className="bg-[#fcfdfa] rounded-[22px] border border-[#b8c5a4] shadow-sm overflow-visible">
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
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#b9c2a8] text-[11px] font-extrabold text-[#2a2e23] uppercase tracking-wider">
                <th className="py-3.5 px-7 w-16">NO</th>
                <th className="py-3.5 px-7">STUDENT ID</th>
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
                      {order.studentId}
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

        {/* Pagination Footer */}
        {boxFilteredOrders.length >= 10 && (
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fbfdf8]">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Order Details</h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">ID: #{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Student</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.studentId}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Time</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.pickupTime}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</span>
                <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                  {selectedOrder.rawItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm font-medium py-1">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shadow-sm border border-gray-200" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-bold">{item.name}</span>
                          <span className="text-gray-500 text-xs font-semibold">{item.quantity} x {item.price} MMK</span>
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