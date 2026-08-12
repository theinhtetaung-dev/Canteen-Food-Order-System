import React, { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  Store, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  ShoppingBag,
  Activity,
  Calendar,
  Utensils,
  ChevronDown,
  Power
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { fetchBranches } from "@furniture/api/branch.api";
import { useAuth } from "@furniture/hooks/useAuth";
import { fetchAllUsers } from "@furniture/api/user.api";
import { fetchAllOrders, updateOrderStatus } from "@furniture/api/order.api";
import { fetchMenuItems } from "@furniture/api/menu.api";

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
}

interface Tbl_Food {
  FoodName: string;
  Price: number;
  IsAvailable: boolean;
  BranchID: number;
}

// Seed mock database records aligning with schema
const MOCK_USERS: Tbl_User[] = [
  { FullName: "Aung Myo", RoleID: 2, CanteenID: 1 },
  { FullName: "Ei Ei Khin", RoleID: 2, CanteenID: 1 },
  { FullName: "Min Htet", RoleID: 2, CanteenID: 2 },
  { FullName: "Hsu Myat", RoleID: 2, CanteenID: 1 },
  { FullName: "Kyaw Zayar", RoleID: 2, CanteenID: 2 },
  { FullName: "Nandar Win", RoleID: 2, CanteenID: 1 }
];

const MOCK_FOODS: Tbl_Food[] = [
  { FoodName: "Chicken Fried Rice", Price: 2500, IsAvailable: true, BranchID: 1 },
  { FoodName: "Shan Noodle", Price: 2000, IsAvailable: true, BranchID: 1 },
  { FoodName: "Pork Dumplings", Price: 2000, IsAvailable: true, BranchID: 1 },
  { FoodName: "Samosa Salad", Price: 1500, IsAvailable: true, BranchID: 2 },
  { FoodName: "Green Tea", Price: 1000, IsAvailable: true, BranchID: 1 },
  { FoodName: "Lime Juice", Price: 1000, IsAvailable: false, BranchID: 2 },
];

const initialOrders: Tbl_Order[] = [
  {
    OrderID: "ORD-9481",
    UserID: "Aung Myo",
    TotalAmount: 6000,
    OrderStatus: "PENDING",
    CreatedAt: "10:15 AM",
    CanteenID: 1,
    itemsSummary: "Chicken Fried Rice x2, Green Tea x1",
    PaymentMethod: "KBZPay",
    PaymentStatus: "PAID"
  },
  {
    OrderID: "ORD-9482",
    UserID: "Ei Ei Khin",
    TotalAmount: 3000,
    OrderStatus: "PREPARING",
    CreatedAt: "10:20 AM",
    CanteenID: 1,
    itemsSummary: "Pork Dumplings x1, Green Tea x1",
    PaymentMethod: "WavePay",
    PaymentStatus: "PAID"
  },
  {
    OrderID: "ORD-9483",
    UserID: "Min Htet",
    TotalAmount: 8000,
    OrderStatus: "READY",
    CreatedAt: "10:35 AM",
    CanteenID: 2,
    itemsSummary: "Shan Noodle x3, Lime Juice x2",
    PaymentMethod: "Cash",
    PaymentStatus: "PAID"
  },
  {
    OrderID: "ORD-9484",
    UserID: "Hsu Myat",
    TotalAmount: 5000,
    OrderStatus: "COMPLETED",
    CreatedAt: "09:45 AM",
    CanteenID: 1,
    itemsSummary: "Chicken Fried Rice x2",
    PaymentMethod: "KBZPay",
    PaymentStatus: "PAID"
  },
  {
    OrderID: "ORD-9485",
    UserID: "Kyaw Zayar",
    TotalAmount: 2500,
    OrderStatus: "PENDING",
    CreatedAt: "10:42 AM",
    CanteenID: 2,
    itemsSummary: "Samosa Salad x1, Lime Juice x1",
    PaymentMethod: "Cash",
    PaymentStatus: "UNPAID"
  },
  {
    OrderID: "ORD-9486",
    UserID: "Nandar Win",
    TotalAmount: 11000,
    OrderStatus: "PREPARING",
    CreatedAt: "10:50 AM",
    CanteenID: 1,
    itemsSummary: "Pork Dumplings x4, Green Tea x3",
    PaymentMethod: "KBZPay",
    PaymentStatus: "PAID"
  }
];

// Sales & Revenue mock charts data categorized by canteen
const hourlyRevenueData = {
  all: [
    { hour: '08:00 AM', sales: 45000 },
    { hour: '09:00 AM', sales: 78000 },
    { hour: '10:00 AM', sales: 112000 },
    { hour: '11:00 AM', sales: 245000 },
    { hour: '12:00 PM', sales: 380000 },
    { hour: '01:00 PM', sales: 290000 },
    { hour: '02:00 PM', sales: 156000 },
    { hour: '03:00 PM', sales: 98000 },
  ],
  '1': [
    { hour: '08:00 AM', sales: 25000 },
    { hour: '09:00 AM', sales: 48000 },
    { hour: '10:00 AM', sales: 72000 },
    { hour: '11:00 AM', sales: 155000 },
    { hour: '12:00 PM', sales: 240000 },
    { hour: '01:00 PM', sales: 180000 },
    { hour: '02:00 PM', sales: 96000 },
    { hour: '03:00 PM', sales: 58000 },
  ],
  '2': [
    { hour: '08:00 AM', sales: 20000 },
    { hour: '09:00 AM', sales: 30000 },
    { hour: '10:00 AM', sales: 40000 },
    { hour: '11:00 AM', sales: 90000 },
    { hour: '12:00 PM', sales: 140000 },
    { hour: '01:00 PM', sales: 110000 },
    { hour: '02:00 PM', sales: 60000 },
    { hour: '03:00 PM', sales: 40000 },
  ]
};

// Top Selling Items mock data by canteen
const topSellingFoods = {
  all: [
    { name: 'Chicken Fried Rice', quantity: 72, revenue: 180000 },
    { name: 'Shan Noodle', quantity: 64, revenue: 128000 },
    { name: 'Pork Dumplings', quantity: 48, revenue: 96000 },
    { name: 'Samosa Salad', quantity: 36, revenue: 54000 },
    { name: 'Green Tea', quantity: 30, revenue: 30000 },
  ],
  '1': [
    { name: 'Chicken Fried Rice', quantity: 45, revenue: 112500 },
    { name: 'Shan Noodle', quantity: 38, revenue: 76000 },
    { name: 'Pork Dumplings', quantity: 28, revenue: 56000 },
    { name: 'Samosa Salad', quantity: 20, revenue: 30000 },
    { name: 'Green Tea', quantity: 18, revenue: 18000 },
  ],
  '2': [
    { name: 'Chicken Fried Rice', quantity: 27, revenue: 67500 },
    { name: 'Shan Noodle', quantity: 26, revenue: 52000 },
    { name: 'Pork Dumplings', quantity: 20, revenue: 40000 },
    { name: 'Samosa Salad', quantity: 16, revenue: 24000 },
    { name: 'Lime Juice', quantity: 12, revenue: 12000 },
  ]
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [dbName, setDbName] = useState("");
  const [userCanteenId, setUserCanteenId] = useState<number | null>(null);
  const [userCanteenName, setUserCanteenName] = useState<string | null>(null);

  const [canteens, setCanteens] = useState<Tbl_Canteen[]>([
    { BranchID: 1, BranchName: "Main Canteen" },
    { BranchID: 2, BranchName: "North Canteen" }
  ]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"Today" | "This Week" | "This Month">("Today");
  const [kitchenOpen, setKitchenOpen] = useState<boolean>(true);
  const [orders, setOrders] = useState<Tbl_Order[]>([]);
  const [rawApiOrders, setRawApiOrders] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);

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
      PaymentStatus: (apiOrder.status === "completed" || apiOrder.status === "ready") ? "PAID" : "UNPAID"
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

  // Filter orders by canteen dropdown
  const filteredOrders = useMemo(() => {
    if (selectedCanteen === "all") return orders;
    const canteenIdNum = parseInt(selectedCanteen, 10);
    return orders.filter(o => o.CanteenID === canteenIdNum);
  }, [orders, selectedCanteen]);

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

  // Compute hourly sales trends dynamically from real orders
  const currentChartData = useMemo(() => {
    const hours = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];
    const salesMap: Record<string, number> = {};
    hours.forEach(h => { salesMap[h] = 0; });

    filteredOrders.forEach(o => {
      if (o.OrderStatus === "CANCELLED") return;

      const match = o.CreatedAt.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hr = parseInt(match[1], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && hr !== 12) hr += 12;
        if (ampm === "AM" && hr === 12) hr = 0;

        let hourStr = "";
        if (hr === 8) hourStr = '08:00 AM';
        else if (hr === 9) hourStr = '09:00 AM';
        else if (hr === 10) hourStr = '10:00 AM';
        else if (hr === 11) hourStr = '11:00 AM';
        else if (hr === 12) hourStr = '12:00 PM';
        else if (hr === 13 || hr === 1) hourStr = '01:00 PM';
        else if (hr === 14 || hr === 2) hourStr = '02:00 PM';
        else if (hr === 15 || hr === 3) hourStr = '03:00 PM';
        else {
          if (hr < 8) hourStr = '08:00 AM';
          else hourStr = '03:00 PM';
        }
        salesMap[hourStr] += o.TotalAmount;
      } else {
        salesMap['12:00 PM'] += o.TotalAmount;
      }
    });

    return hours.map(h => ({
      hour: h,
      sales: salesMap[h]
    }));
  }, [filteredOrders]);

  // Compute top selling food items dynamically from real order items
  const currentTopFoods = useMemo(() => {
    const foodAggregates: Record<string, { quantity: number; revenue: number }> = {};

    filteredOrders.forEach(o => {
      if (o.OrderStatus === "CANCELLED") return;

      const apiOrder = rawApiOrders.find(ao => `ORD-${ao.orderId}` === o.OrderID);
      if (apiOrder && apiOrder.items) {
        apiOrder.items.forEach((item: any) => {
          if (!foodAggregates[item.name]) {
            foodAggregates[item.name] = { quantity: 0, revenue: 0 };
          }
          foodAggregates[item.name].quantity += item.quantity;
          foodAggregates[item.name].revenue += item.quantity * item.price;
        });
      }
    });

    const itemsArray = Object.entries(foodAggregates)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Fallback if empty to avoid rendering empty screen
    if (itemsArray.length === 0) {
      return [
        { name: 'No sales yet', quantity: 0, revenue: 0 }
      ];
    }

    return itemsArray;
  }, [filteredOrders, rawApiOrders]);

  return (
    <div className="w-full space-y-6 font-sans text-gray-800">
      {/* 2. TOP BAR CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{dbName || user?.name || user?.rollNumber || "Canteen Admin"}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tracking student meal requests in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Canteen Selector Dropdown */}
          <div className="relative">
            <select
              disabled={userCanteenId !== null}
              value={selectedCanteen}
              onChange={(e) => setSelectedCanteen(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/10 focus:border-[#5b7a42] cursor-pointer shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {userCanteenId === null ? (
                <>
                  <option value="all">All Canteens</option>
                  {canteens.map(c => (
                    <option key={c.BranchID} value={c.BranchID.toString()}>{c.BranchName}</option>
                  ))}
                </>
              ) : (
                <option value={userCanteenId.toString()}>{userCanteenName || "My Canteen"}</option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/10 focus:border-[#5b7a42] cursor-pointer shadow-sm"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Kitchen Status Toggle */}
          <button
            onClick={() => setKitchenOpen(!kitchenOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
              kitchenOpen
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-rose-50 border-rose-100 text-rose-700"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Kitchen: {kitchenOpen ? "OPEN" : "CLOSED"}</span>
            <span className={`w-2 h-2 rounded-full ${kitchenOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          </button>
        </div>
      </div>

      {/* 3. TOP SUMMARY CARDS (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">TOTAL REVENUE</span>
            <p className="text-xl font-black text-slate-900 mt-1.5">{stats.totalRevenue.toLocaleString()} MMK</p>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% from yesterday
            </span>
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
            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-2 inline-block">
              +8.2% vs previous period
            </span>
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
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" /> High Priority Queue
            </span>
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
            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              {stats.outOfStockItems} Out of Stock
            </span>
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
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b7a42" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5b7a42" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [`${value.toLocaleString()} MMK`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#5b7a42" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (30%): Top Selling Food Items */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Top Selling Food Items</h3>
            <p className="text-[10px] text-slate-400 font-medium">Best performing menu dishes</p>
          </div>

          <div className="space-y-3.5 mt-4">
            {currentTopFoods.map((item, idx) => {
              const maxVal = currentTopFoods[0]?.quantity || 1;
              const percent = Math.round((item.quantity / maxVal) * 100);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 truncate max-w-[120px]">{idx + 1}. {item.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{item.quantity} sold • {item.revenue.toLocaleString()} MMK</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#5b7a42] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
            <h3 className="text-sm font-extrabold text-slate-900">Live Kitchen Queue</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
            {filteredOrders.filter(o => o.OrderStatus !== "COMPLETED" && o.OrderStatus !== "CANCELLED").length} ACTIVE ORDERS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-150">
                <th className="py-3 px-4 font-bold rounded-l-lg">ORDER ID</th>
                <th className="py-3 px-4">CUSTOMER NAME</th>
                <th className="py-3 px-4">ITEMS SUMMARY</th>
                <th className="py-3 px-4">TOTAL AMOUNT</th>
                <th className="py-3 px-4">PAYMENT STATUS</th>
                <th className="py-3 px-4 rounded-r-lg">ORDER STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredOrders.map((order) => {
                let orderBadgeColor = 'bg-slate-100 text-slate-600';
                if (order.OrderStatus === 'PENDING') orderBadgeColor = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
                else if (order.OrderStatus === 'PREPARING') orderBadgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                else if (order.OrderStatus === 'READY') orderBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                else if (order.OrderStatus === 'COMPLETED') orderBadgeColor = 'bg-slate-100 text-slate-500';
                else if (order.OrderStatus === 'CANCELLED') orderBadgeColor = 'bg-rose-50 text-rose-700';

                const payBadgeColor = order.PaymentStatus === 'PAID' 
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100';

                return (
                  <tr key={order.OrderID} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">{order.OrderID}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{order.UserID}</td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate" title={order.itemsSummary}>
                      {order.itemsSummary}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {order.TotalAmount.toLocaleString()} MMK
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${payBadgeColor}`}>
                        {order.PaymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${orderBadgeColor}`}>
                        {order.OrderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
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