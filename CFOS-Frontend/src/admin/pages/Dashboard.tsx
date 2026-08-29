import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Store, 
  AlertCircle, 
  DollarSign, 
  ShoppingBag,
  Activity,
  Calendar,
  Utensils,
  ChevronDown,
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { fetchBranches } from "@user/api/branch.api";
import { useAuth } from "@user/hooks/useAuth";
import { fetchAllUsers } from "@user/api/user.api";
import { fetchAllOrders, updateOrderStatus } from "@user/api/order.api";
import { fetchMenuItems } from "@user/api/menu.api";
import { fetchReport } from "@user/api/report.api";
import { fetchAdminDashboard } from "@user/api/dashboard.api";

// --- Database Schema Alignment Interfaces ---
interface Tbl_User {
  FullName: string;
  RoleID: number;
  CanteenID: number;
}

interface Tbl_Canteen {
  BranchID: number;
  BranchName: string;
}

interface Tbl_Order {
  OrderID: string;
  UserID: string; // references Tbl_User.FullName
  TotalAmount: number;
  OrderStatus: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  CreatedAt: string;
  CanteenID: number; // references Tbl_Canteen.BranchID
  itemsSummary: string; // e.g. "Chicken Fried Rice x2, Soda x1"
  PaymentMethod: string;
  PaymentStatus: 'PAID' | 'UNPAID';
  items?: any[];
  RawDate?: Date;
}

interface Tbl_Food {
  FoodName: string;
  Price: number;
  IsAvailable: boolean;
  BranchID: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4", "#ec4899"];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbName, setDbName] = useState("");
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [userCanteenName, setUserCanteenName] = useState<string | null>(null);

  const [canteens, setCanteens] = useState<Tbl_Canteen[]>([
    { BranchID: 1, BranchName: "Main Canteen" },
    { BranchID: 2, BranchName: "North Canteen" }
  ]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("Today");
  const [kitchenOpen, setKitchenOpen] = useState<boolean>(true);
  const [orders, setOrders] = useState<Tbl_Order[]>([]);
  const [rawApiOrders, setRawApiOrders] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  // Map backend Order to Tbl_Order
  const mapToTblOrder = (apiOrder: any): Tbl_Order => {
    const formattedTime = apiOrder.createdAt
      ? new Date(apiOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "12:00 PM";
      
    return {
      OrderID: apiOrder.id,
      UserID: apiOrder.userId || "Student",
      TotalAmount: apiOrder.totalPrice,
      OrderStatus: (apiOrder.status || "pending").toUpperCase() as Tbl_Order["OrderStatus"],
      CreatedAt: formattedTime,
      CanteenID: apiOrder.canteenId ?? 1,
      itemsSummary: apiOrder.items && apiOrder.items.length > 0
        ? apiOrder.items.map((it: any) => `${it.name} x${it.quantity}`).join(", ")
        : "No items",
      PaymentMethod: "Cash",
      PaymentStatus: (apiOrder.status === "completed" || apiOrder.status === "ready") ? "PAID" : "UNPAID",
      items: apiOrder.items || [],
      RawDate: apiOrder.createdAt ? new Date(apiOrder.createdAt) : new Date()
    };
  };

  // Fetch all orders
  const loadDashboardData = async () => {
    try {
      const apiOrders = await fetchAllOrders();
      setRawApiOrders(apiOrders);
      setOrders(apiOrders.map(mapToTblOrder));
    } catch (err) {
      console.error("Failed to load orders in dashboard", err);
    }
  };

  const loadChartData = async () => {
    try {
      const canteenIdParam = selectedCanteen === "all" ? undefined : parseInt(selectedCanteen, 10);
      const res = await fetchAdminDashboard(dateRange, canteenIdParam);
      setChartData(res.salesTrends || []);
      const mappedFoods = (res.topSellingFoods || []).map((f: any) => ({
        name: f.foodName || "Unknown",
        quantity: f.quantitySold,
        revenue: f.revenue
      }));
      setPieData(mappedFoods.length > 0 ? mappedFoods : [{ name: 'No sales', quantity: 0, revenue: 0 }]);
    } catch (err) {
      console.error("Failed to load chart data", err);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [dateRange, selectedCanteen]);

  useEffect(() => {
    async function loadDbUser() {
      if (!user) return;
      try {
        const allUsers = await fetchAllUsers();
        const found = allUsers.find(u => u.userName.toLowerCase() === user.rollNumber.toLowerCase());
        if (found) {
          setDbName(found.fullName || found.userName);
          if (found.canteenId) {
            setUserCanteenId(found.canteenId);
            setUserCanteenName(found.canteenName);
            setSelectedCanteen(found.canteenId.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load db user in dashboard", err);
      }
    }
    loadDbUser();
  }, [user]);

  // Load canteens and foods dropdown list on mount
  useEffect(() => {
    async function loadCanteensAndFoods() {
      try {
        const branches = await fetchBranches();
        if (branches && branches.length > 0) {
          setCanteens(branches.map(b => ({
            BranchID: b.branchId,
            BranchName: b.branchName
          })));
        }
        
        const items = await fetchMenuItems();
        setFoodItems(items);
      } catch (err) {
        console.error("Failed to load branches or foods", err);
      }
    }
    loadCanteensAndFoods();
    loadDashboardData();
  }, []);

  // Filter orders by canteen and date range dropdowns
  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Filter by canteen
    if (selectedCanteen !== "all") {
      const canteenIdNum = parseInt(selectedCanteen, 10);
      result = result.filter(o => o.CanteenID === canteenIdNum);
    }
    
    // Filter by date range
    const today = new Date();
    if (dateRange === "Today") {
      result = result.filter(o => {
        if (!o.RawDate) return false;
        return o.RawDate.getDate() === today.getDate() &&
               o.RawDate.getMonth() === today.getMonth() &&
               o.RawDate.getFullYear() === today.getFullYear();
      });
    } else if (dateRange === "This Week") {
      // Current calendar week (since Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      result = result.filter(o => {
        if (!o.RawDate) return false;
        return o.RawDate >= startOfWeek;
      });
    } else if (dateRange === "This Month" || dateRange === "Monthly") {
      result = result.filter(o => {
        if (!o.RawDate) return false;
        return o.RawDate.getMonth() === today.getMonth() &&
               o.RawDate.getFullYear() === today.getFullYear();
      });
    } else if (dateRange === "Yearly") {
      result = result.filter(o => {
        if (!o.RawDate) return false;
        return o.RawDate.getFullYear() === today.getFullYear();
      });
    }
    
    return result;
  }, [orders, selectedCanteen, dateRange]);

  const activeOrders = useMemo(() => {
    return filteredOrders.filter(o => o.OrderStatus !== "COMPLETED" && o.OrderStatus !== "CANCELLED");
  }, [filteredOrders]);

  // Compute stats metrics dynamically
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders
      .filter(o => o.OrderStatus === "COMPLETED")
      .reduce((sum, o) => sum + o.TotalAmount, 0);

    const totalOrdersCount = filteredOrders.length;

    const pendingQueueCount = filteredOrders.filter(
      o => o.OrderStatus === "PENDING" || o.OrderStatus === "PREPARING"
    ).length;

    // Filter foods by selected canteen
    const canteenFoods = selectedCanteen === "all"
      ? foodItems
      : foodItems.filter(f => f.canteen === parseInt(selectedCanteen, 10));

    const activeItems = canteenFoods.filter(f => f.isAvailable).length;
    const outOfStockItems = canteenFoods.filter(f => !f.isAvailable).length;

    return {
      totalRevenue,
      totalOrdersCount,
      pendingQueueCount,
      activeItems,
      outOfStockItems
    };
  }, [filteredOrders, foodItems, selectedCanteen]);

  // Transition status logic
  const transitionOrderStatus = async (orderId: string, currentStatus: Tbl_Order["OrderStatus"]) => {
    let nextStatus: string = "";
    if (currentStatus === "PENDING") nextStatus = "preparing";
    else if (currentStatus === "PREPARING") nextStatus = "ready";
    else if (currentStatus === "READY") nextStatus = "completed";

    if (!nextStatus) return;

    try {
      await updateOrderStatus(orderId, nextStatus);
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to transition order status", err);
    }
  };

  // Option change from status dropdown select
  const handleSelectStatus = async (orderId: string, val: Tbl_Order["OrderStatus"]) => {
    try {
      await updateOrderStatus(orderId, val.toLowerCase());
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to select order status", err);
    }
  };



  return (
    <div className="w-full space-y-6 font-sans text-gray-800">
      {/* 2. TOP BAR CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{userCanteenName || "Canteen Admin"}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/10 focus:border-[#5b7a42] cursor-pointer shadow-sm"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. TOP SUMMARY CARDS (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">TOTAL REVENUE</span>
            <p className="text-xl font-black text-slate-900 mt-1.5">{stats.totalRevenue.toLocaleString()} MMK</p>
          </div>
          <div className="p-3 bg-[#e2f0c2] text-[#284208] rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">TOTAL ORDERS</span>
            <p className="text-xl font-black text-slate-900 mt-1.5">{stats.totalOrdersCount} Orders</p>
          </div>
          <div className="p-3 bg-[#e2f0c2] text-[#284208] rounded-xl shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pending Kitchen Queue */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">PENDING QUEUE</span>
            <p className="text-xl font-black text-slate-900 mt-1.5">{stats.pendingQueueCount} Active</p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Active Menu Items vs Out-of-Stock */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">MENU SUMMARY</span>
            <p className="text-xl font-black text-slate-900 mt-1.5">{stats.activeItems} Active</p>
          </div>
          <div className="p-3 bg-[#e2f0c2] text-[#284208] rounded-xl shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. MIDDLE ANALYTICS SECTION (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left (70%): Sales & Revenue Trends Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Sales & Revenue Trends</h3>
            <p className="text-[10px] text-slate-400 font-medium">Hourly breakdown of processed order receipts</p>
          </div>

          <div className="h-[240px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b7a42" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5b7a42" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} MMK`, 'Sales']}
                />
                <Area type="monotone" dataKey="value" stroke="#5b7a42" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (30%): Top Selling Food Items */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Top Selling Food Items</h3>
            <p className="text-[10px] text-slate-400 font-medium">Best performing menu dishes</p>
          </div>

          <div className="h-[240px] w-full mt-4 flex items-center justify-center">
            {pieData.length === 1 && pieData[0].name === "No sales" ? (
              <span className="text-xs text-slate-400 font-medium">No sales yet</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="quantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#ffffff', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      const item = props.payload;
                      return [`${value} sold (${item.revenue.toLocaleString()} MMK)`, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM LIVE ORDER QUEUE TABLE (Actionable) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">Active Orders</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
            {activeOrders.length} ACTIVE ORDERS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-150">
                <th className="py-3 px-4 font-bold rounded-l-lg">NO.</th>
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">CUSTOMER NAME</th>
                <th className="py-3 px-4">TOTAL AMOUNT</th>
                <th className="py-3 px-4 rounded-r-lg">ORDER STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {activeOrders.map((order, index) => {
                let orderBadgeColor = 'bg-slate-100 text-slate-600';
                if (order.OrderStatus === 'PENDING') orderBadgeColor = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
                else if (order.OrderStatus === 'PREPARING') orderBadgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                else if (order.OrderStatus === 'READY') orderBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                else if (order.OrderStatus === 'COMPLETED') orderBadgeColor = 'bg-slate-100 text-slate-500';
                else if (order.OrderStatus === 'CANCELLED') orderBadgeColor = 'bg-rose-50 text-rose-700';

                return (
                  <tr 
                    key={order.OrderID} 
                    onClick={() => navigate(`/orders?orderId=${order.OrderID}`)}
                    className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{index + 1}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">{order.OrderID}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{order.UserID}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {order.TotalAmount.toLocaleString()} MMK
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${orderBadgeColor}`}>
                        {order.OrderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {activeOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No active orders found in the selected canteen branch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
