import React, { useState, useEffect, useRef } from "react";
import { fetchAllOrders } from "@user/api/order.api";
import { List, RefreshCw, ChevronLeft, ChevronRight, Eye, X, LayoutGrid, Calendar } from "lucide-react";
import { useAuth } from "@user/hooks/useAuth";
import { fetchAllUsers } from "@user/api/user.api";
import { formatPrice, formatDate } from "@user/lib/utils";

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

export function OrderHistory() {
  const { user } = useAuth();
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewStyle, setViewStyle] = useState<"card" | "table">("table");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, selectedStatus]);

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
        console.error("Failed to load db user in order history", err);
      }
    }
    loadDbUser();
  }, [user]);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await fetchAllOrders();
      const mapped = data.map((d: any) => {
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
      console.error("Failed to load orders history", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = React.useMemo(() => {
    let result = userCanteenId === null ? orders : orders.filter(o => o.canteenId === userCanteenId);

    // Filter by Date
    if (startDate || endDate) {
      result = result.filter((order) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (orderDate > end) return false;
        }
        return true;
      });
    }

    // Filter by Status
    if (selectedStatus !== "ALL") {
      result = result.filter((o) => o.status === selectedStatus);
    }

    // Sort: Newest orders first
    return [...result].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [orders, userCanteenId, startDate, endDate, selectedStatus]);

  const ORDERS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const visibleOrders = filteredOrders.length >= 10
    ? filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)
    : filteredOrders;

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

  return (
    <div className="w-full p-10 space-y-7 bg-[#f6f8f2] min-h-screen text-[#1a1a1a] font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#111111]">
            Order History
          </h1>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Date Filter & Search Controls */}
      <div className="bg-[#fcfdfa] p-5 rounded-[22px] border border-[#b8c5a4] shadow-sm flex flex-col lg:flex-row items-center gap-4">
        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <div className="relative">
            <label className="block text-[9px] font-black text-[#5b7a42] uppercase tracking-wider mb-1">Start Date</label>
            <div 
              onClick={() => startDateRef.current?.showPicker()}
              className="relative h-[38px] w-full lg:w-44 bg-white border border-[#dce5c7] rounded-xl flex items-center justify-between px-3 hover:border-[#8db552] transition-colors focus-within:ring-2 focus-within:ring-[#8db552]/10 focus-within:border-transparent cursor-pointer"
            >
              <span className={`text-xs font-semibold ${startDate ? 'text-[#284208]' : 'text-gray-405'}`}>
                {startDate ? formatDate(new Date(startDate)) : 'Select date'}
              </span>
              <Calendar className="w-4 h-4 text-gray-450 pointer-events-none" />
              <input 
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[9px] font-black text-[#5b7a42] uppercase tracking-wider mb-1">End Date</label>
            <div 
              onClick={() => endDateRef.current?.showPicker()}
              className="relative h-[38px] w-full lg:w-44 bg-white border border-[#dce5c7] rounded-xl flex items-center justify-between px-3 hover:border-[#8db552] transition-colors focus-within:ring-2 focus-within:ring-[#8db552]/10 focus-within:border-transparent cursor-pointer"
            >
              <span className={`text-xs font-semibold ${endDate ? 'text-[#284208]' : 'text-gray-405'}`}>
                {endDate ? formatDate(new Date(endDate)) : 'Select date'}
              </span>
              <Calendar className="w-4 h-4 text-gray-450 pointer-events-none" />
              <input 
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48 relative">
          <label className="block text-[9px] font-black text-[#5b7a42] uppercase tracking-wider mb-1">Filter by Status</label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-[38px] px-4 rounded-xl bg-white border border-[#dce5c7] focus:outline-none focus:ring-2 focus:ring-[#8db552]/10 focus:border-[#8db552] text-xs font-semibold text-gray-700 appearance-none pr-8 cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%235b7a42%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-end gap-2 self-end lg:self-auto w-full lg:w-auto pt-4 lg:pt-0 lg:ml-auto">
          {(startDate || endDate || selectedStatus !== "ALL") && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedStatus("ALL");
              }}
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer h-[38px] flex items-center"
            >
              Clear Filters
            </button>
          )}

          {/* View Toggle */}
          <div className="flex bg-[#eaeaea]/60 rounded-xl p-1 border border-gray-200 h-[38px] items-center">
            <button
              type="button"
              onClick={() => setViewStyle("table")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewStyle === "table" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewStyle("card")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewStyle === "card" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Card
            </button>
          </div>
        </div>
      </div>

      {/* Main Order History Table/Grid */}
      <div className="bg-[#fcfdfa] rounded-[22px] border border-[#b8c5a4] shadow-sm overflow-visible">
        {viewStyle === "table" ? (
          <div className="overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#b9c2a8] text-[11px] font-extrabold text-[#2a2e23] uppercase tracking-wider">
                  <th className="py-3.5 px-7 w-16">NO</th>
                  <th className="py-3.5 px-7">USER</th>
                  <th className="py-3.5 px-6">TOTAL AMOUNT</th>
                  <th className="py-3.5 px-6 text-center">STATUS</th>
                  <th className="py-3.5 px-7 text-center">DATE</th>
                  <th className="py-3.5 px-7 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7d8] text-xs font-semibold text-[#3d4235]">
                {visibleOrders.map((order, idx) => {
                  const globalIndex = (currentPage - 1) * ORDERS_PER_PAGE + idx + 1;
                  return (
                    <tr key={order.id} className="hover:bg-[#f6f8f0] transition-colors">
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
                      <td className="py-4 px-7 text-center font-semibold text-gray-500">
                        {order.createdAt ? formatDate(new Date(order.createdAt)) : "N/A"}
                      </td>
                      <td className="py-4 px-7 text-center">
                        <button 
                          onClick={() => setSelectedOrder(order)} 
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#e2e7d8] hover:bg-[#d4dbc8] text-[#414b35] rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {visibleOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-bold">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-7">
            {visibleOrders.map((order, idx) => {
              const globalIndex = (currentPage - 1) * ORDERS_PER_PAGE + idx + 1;
              return (
                <div 
                  key={order.id} 
                  className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-slate-50 pb-4">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-50 text-[10px] font-extrabold text-slate-500 font-mono group-hover:bg-[#e2f0c2] group-hover:text-[#284208] transition-colors shrink-0">
                          {globalIndex}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block leading-tight">
                            {order.studentId}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1">
                            <Calendar className="w-3 h-3 shrink-0 text-slate-400" />
                            {order.createdAt ? formatDate(new Date(order.createdAt)) : "N/A"}
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
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end mt-5 pt-3 border-t border-slate-50">
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#e2e7d8] hover:bg-[#d4dbc8] text-[#414b35] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {visibleOrders.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 font-bold">
                No matching records found.
              </div>
            )}
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
                          ? "bg-[#2a3eb1] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#2a3eb1]"
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
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{selectedOrder.userRole || "User"}</span>
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
                            <span className="text-red-650 text-[10px] font-extrabold bg-red-50 border border-red-100/50 px-1 py-0.5 rounded w-fit mt-0.5">Comment: {item.comment}</span>
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

export default OrderHistory;
