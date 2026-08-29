import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  ChevronDown,
  ShoppingBag,
  Banknote,
  Download,
  FileSpreadsheet,
  Printer,
  PackageOpen,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fetchReport, type ReportResponseModel } from "../../user/api/report.api";
import { fetchAllOrders } from "../../user/api/order.api";
import type { Order } from "../../user/types/order";
import { useAuth } from "../../user/hooks/useAuth";
import { fetchAllUsers } from "../../user/api/user.api";

export function Report() {
  const { user } = useAuth();
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);

  const [orderStatus, setOrderStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stats, setStats] = useState<ReportResponseModel | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [orderStatus, startDate, endDate]);



  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const min = String(date.getMinutes()).padStart(2, '0');
    
    return `${dd}-${mm}-${yyyy} ${hours}:${min} ${ampm}`;
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "dd-mm-yyyy";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    return `${day}-${month}-${year}`;
  };

  const loadData = async () => {
    setIsGenerating(true);
      
      let currentCanteenId = userCanteenId;
      if (!currentCanteenId && user) {
        try {
          const allUsers = await fetchAllUsers();
          const found = allUsers.find((u: any) => u.userName.toLowerCase() === user.rollNumber.toLowerCase());
          if (found && found.canteenId) {
            currentCanteenId = found.canteenId;
            setUserCanteenId(currentCanteenId);
          }
        } catch(e) { 
          console.error("Failed to load db user in report", e);
        }
      }

      let allOrders: Order[] = [];
      try {
        allOrders = await fetchAllOrders();
      } catch (ordersErr) {
        console.error("Failed to fetch all orders", ordersErr);
      }
      
      let filteredDateOrders = allOrders;
      if (currentCanteenId) {
        filteredDateOrders = filteredDateOrders.filter(o => o.canteenId === currentCanteenId);
      }

      if (startDate) {
        const startD = new Date(startDate);
        if (!isNaN(startD.getTime())) {
          filteredDateOrders = filteredDateOrders.filter(o => new Date(o.createdAt) >= startD);
        }
      }
      if (endDate) {
        const endD = new Date(endDate);
        if (!isNaN(endD.getTime())) {
          endD.setHours(23, 59, 59, 999);
          filteredDateOrders = filteredDateOrders.filter(o => new Date(o.createdAt) <= endD);
        }
      }
      
      const totalOrdersCount = filteredDateOrders.filter(o => o.status.toLowerCase() === "completed").length;
      const totalRevenueCount = filteredDateOrders
        .filter(o => o.status.toLowerCase() === "completed")
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const totalItemsSoldCount = filteredDateOrders
        .filter(o => o.status.toLowerCase() === "completed")
        .reduce((sum, o) => sum + (o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0), 0);

      setStats({
        totalOrders: totalOrdersCount,
        totalRevenue: totalRevenueCount,
        totalItemsSold: totalItemsSoldCount,
        foodSales: [],
        periodBreakdown: []
      });

      setOrders(filteredDateOrders);
      setIsGenerating(false);
  };

  const handleDownloadExcel = () => {
    if (orders.length === 0) return;
    
    const headers = ['NO', 'USER', 'TOTAL AMOUNT (MMK)', 'STATUS', 'ORDER DATE'];
    const rows = orders.map((order, idx) => [
      (idx + 1).toString(),
      order.userId,
      order.totalPrice.toString(),
      order.status,
      formatDateTime(order.createdAt)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `canteen_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleGenerateReport = () => {
    loadData();
  };

  // Filter for the Sales Master List table based on live search and order status
  const visibleOrders = orders.filter((order) => {
    const matchesStatus = orderStatus === "all" || order.status.toLowerCase() === orderStatus.toLowerCase();
    return matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-amber-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div id="printable-report" className="p-8 max-w-[1600px] mx-auto min-h-screen font-sans space-y-6 animate-in fade-in duration-300 bg-[#fdfefb]">
      <style>{`
        @media print {
          /* Setup page size and margins for A4 */
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }

          /* Hide everything outside of the printable report */
          aside, 
          nav, 
          header, 
          footer, 
          .no-print {
            display: none !important;
          }

          /* Reset layout wrapper of the dashboard to normal block flow */
          .flex.min-h-screen {
            display: block !important;
            min-height: 0 !important;
            background: transparent !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
          }

          /* Reset report container for printing */
          #printable-report {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            display: block !important;
          }

          /* Make summary cards responsive/inline for print */
          .grid.grid-cols-1.md\\:grid-cols-3 {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 > div {
            padding: 10px !important;
            border-radius: 12px !important;
            border: 1px solid #e2e8d5 !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 p {
            font-size: 7.5pt !important;
            letter-spacing: 0.02em !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 h3 {
            font-size: 15pt !important;
            white-space: nowrap !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 h3 span {
            font-size: 10pt !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 .w-12.h-12 {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 .w-12.h-12 svg {
            width: 16px !important;
            height: 16px !important;
          }

          .grid.grid-cols-1.md\\:grid-cols-3 .flex.items-start {
            gap: 8px !important;
          }

          #printable-report h1 {
            font-size: 20pt !important;
          }

          /* Keep table neat on A4 */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          th, td {
            padding: 8px 10px !important;
            font-size: 8.5pt !important;
          }

          /* Prevent page-breaks in the middle of card sections or rows */
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          /* Stop animations & transitions */
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1c2e0a] tracking-tight">Canteen Operations Reports</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Access daily sales, order analytics, and food performance data.
          </p>
        </div>
      </div>

      {/* Filter Panel (White Card) */}
      <div className="bg-white border border-[#e2e8d5] rounded-3xl p-6 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <label className="block text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-wider mb-1.5">Order Status</label>
            <select 
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full appearance-none bg-white border border-[#dce5c7] text-[#284208] text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-[#8db552]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-wider mb-1.5">Start Date</label>
            <div className="relative w-full h-[42px] bg-white border border-[#dce5c7] rounded-xl flex items-center justify-between px-4 hover:border-[#8db552] transition-colors focus-within:ring-2 focus-within:ring-[#8db552] focus-within:border-transparent">
              <span className={`text-sm font-semibold ${startDate ? 'text-[#284208]' : 'text-gray-400'}`}>
                {formatDateDisplay(startDate)}
              </span>
              <Calendar className="w-4 h-4 text-gray-450 pointer-events-none" />
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-transparent"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-wider mb-1.5">End Date</label>
            <div className="relative w-full h-[42px] bg-white border border-[#dce5c7] rounded-xl flex items-center justify-between px-4 hover:border-[#8db552] transition-colors focus-within:ring-2 focus-within:ring-[#8db552] focus-within:border-transparent">
              <span className={`text-sm font-semibold ${endDate ? 'text-[#284208]' : 'text-gray-400'}`}>
                {formatDateDisplay(endDate)}
              </span>
              <Calendar className="w-4 h-4 text-gray-450 pointer-events-none" />
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-transparent"
              />
            </div>
          </div>

          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full bg-[#0f4d2a] text-white flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b3b20] transition-colors shadow-sm disabled:opacity-70 h-[42px]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Filtering...</span>
              </>
            ) : (
              "Filter"
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#e2e8d5] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e2f3be] border-2 border-white flex items-center justify-center text-[#3f5d13] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#5b7a42] uppercase tracking-widest mb-0.5">TOTAL COMPLETED ORDERS</p>
              <h3 className="text-3xl font-black text-[#1c2e0a]">
                {stats?.totalOrders || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8d5] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e2f3be] border-2 border-white flex items-center justify-center text-[#3f5d13] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#5b7a42] uppercase tracking-widest mb-0.5">TOTAL REVENUE</p>
              <h3 className="text-3xl font-black text-[#1c2e0a]">
                {(stats?.totalRevenue || 0).toLocaleString()}<span className="text-xl text-[#5b7a42] ml-1">MMK</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8d5] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e2f3be] border-2 border-white flex items-center justify-center text-[#3f5d13] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <PackageOpen className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#5b7a42] uppercase tracking-widest mb-0.5">TOTAL ITEMS SOLD</p>
              <h3 className="text-3xl font-black text-[#1c2e0a]">
                {stats?.totalItemsSold || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-[#e2e8d5] rounded-3xl shadow-sm flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-[#e2e8d5] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfdfa]">
          <h3 className="text-xl font-black text-[#1c2e0a]">Sales Master List</h3>
          
          <div className="flex items-center gap-3 no-print">
            <button 
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 border border-[#dce5c7] text-[#284208] rounded-xl text-xs font-bold hover:bg-[#f4f7ec] transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-[#3f5d13] text-white rounded-xl text-xs font-bold hover:bg-[#2e450e] transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Audit</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f7ec] border-b border-[#e2e8d5]">
                <th className="py-4 px-6 text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-widest w-20">NO</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-widest">CUSTOMER</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-widest text-right">TOTAL AMOUNT</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-widest">STATUS</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-[#5b7a42] uppercase tracking-widest">ORDER DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8d5]">
              {visibleOrders.map((order, idx) => {
                const isRowVisibleOnScreen = idx >= (currentPage - 1) * ITEMS_PER_PAGE && idx < currentPage * ITEMS_PER_PAGE;
                return (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-[#fcfdfa] transition-colors ${isRowVisibleOnScreen ? '' : 'hidden print:table-row'}`}
                  >
                    <td className="py-4 px-6 text-sm font-bold text-gray-500 font-mono">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-[#1c2e0a]">
                      {order.userId}
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-[#3f5d13] text-right">
                      {order.totalPrice.toLocaleString()} MMK
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-600">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {visibleOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500 font-semibold">
                    No orders found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {(() => {
          const totalPages = Math.ceil(visibleOrders.length / ITEMS_PER_PAGE);
          if (totalPages <= 1) return null;

          return (
            <div className="p-4 border-t border-[#e2e8d5] bg-[#FAFBF8] flex items-center justify-between text-xs text-gray-500 rounded-b-3xl no-print">
              <div>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, visibleOrders.length)} of {visibleOrders.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-slate-150 rounded-full shadow-sm text-slate-550 hover:bg-slate-55 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
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
                              : "text-slate-600 hover:bg-slate-55 hover:text-[#284208]"
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
            </div>
          );
        })()}
        
      </div>
    </div>
  );
}

export default Report;
