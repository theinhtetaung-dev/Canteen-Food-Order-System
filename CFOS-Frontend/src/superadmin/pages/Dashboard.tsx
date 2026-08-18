import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Users, 
  UserCheck, 
  Shield, 
  Plus, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
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
} from 'recharts';
import { fetchStudents, fetchKitchenAdmins } from '@user/api/user.api';
import { fetchBranches, type Branch } from '@user/api/branch.api';
import { useAuth } from "@user/hooks/useAuth";

// Registration growth mock data for last 30 days
const registrationGrowthData = [
  { date: 'Jul 12', signups: 15 },
  { date: 'Jul 15', signups: 22 },
  { date: 'Jul 18', signups: 18 },
  { date: 'Jul 21', signups: 32 },
  { date: 'Jul 24', signups: 25 },
  { date: 'Jul 27', signups: 40 },
  { date: 'Jul 30', signups: 48 },
  { date: 'Aug 02', signups: 35 },
  { date: 'Aug 05', signups: 55 },
  { date: 'Aug 08', signups: 62 },
  { date: 'Aug 11', signups: 74 },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalAdminsCount, setTotalAdminsCount] = useState<number>(0);
  const [totalCanteens, setTotalCanteens] = useState<number>(0);
  const [activeStudents, setActiveStudents] = useState<number>(0);
  const [recentAdmins, setRecentAdmins] = useState<any[]>([]);
  const [canteenAllocations, setCanteenAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setIsLoading(true);
        // Fetch Students
        const students = await fetchStudents();
        setTotalUsers(students.length);
        setActiveStudents(Math.floor(students.length * 0.95)); // 95% Active

        // Fetch Canteens/Branches
        const branches = await fetchBranches();
        setTotalCanteens(branches.length);

        // Fetch Canteen Admins
        const admins = await fetchKitchenAdmins();
        setTotalAdminsCount(admins.length);
        
        // Take top 4 most recent admins
        setRecentAdmins(admins.slice(0, 4));

        // Create canteen allocation overview mapping canteens to admins
        const allocations = branches.map((branch) => {
          const assignedAdmin = admins.find(
            (admin) => admin.canteenId === branch.branchId || admin.restaurant === branch.branchName
          );
          return {
            id: branch.branchId,
            canteenName: branch.branchName,
            location: branch.location || 'Campus Center',
            adminName: assignedAdmin ? assignedAdmin.adminId : 'Unassigned',
          };
        });
        setCanteenAllocations(allocations.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardStats();
  }, []);

  // Pie chart cell colors
  const roleDistributionData = [
    { name: 'Students', value: totalUsers || 1, color: '#88C425' },
    { name: 'Canteen Admins', value: totalAdminsCount || 1, color: '#3B5B11' },
    { name: 'Super Admins', value: 1, color: '#A3D944' },
  ];

  return (
    <div className="w-full space-y-8 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#88C425] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#88C425] animate-pulse" />
            Superadmin Console
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Welcome back, {user?.name || 'Super Admin'}
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage system configuration, campus canteens, and platform authentication.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/branches')}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-xs text-gray-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            Add New Canteen
          </button>
          <button
            onClick={() => navigate('/kitchen-admin')}
            className="px-4 py-2.5 rounded-xl bg-[#88C425] hover:bg-[#72A61E] text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm shadow-[#88C425]/20"
          >
            <Plus className="w-4 h-4 text-white" />
            Create Canteen Admin
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Canteens */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between border border-gray-100/60 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">TOTAL CANTEENS</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalCanteens}</p>
            <span className="text-[10px] font-bold text-[#3B5B11] bg-[#E1EEB4] px-2 py-0.5 rounded-full mt-2 inline-block">
              Active Branches
            </span>
          </div>
          <div className="p-3 bg-[#E1EEB4] rounded-2xl text-[#3B5B11] shrink-0">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Canteen Admins */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between border border-gray-100/60 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">CANTEEN ADMINS</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalAdminsCount}</p>
            <span className="text-[10px] font-bold text-[#3B5B11] bg-[#E1EEB4] px-2 py-0.5 rounded-full mt-2 inline-block">
              Assigned Admins
            </span>
          </div>
          <div className="p-3 bg-[#E1EEB4] rounded-2xl text-[#3B5B11] shrink-0">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Registered Students */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between border border-gray-100/60 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">REGISTERED STUDENTS</span>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {totalUsers.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#3B5B11] bg-[#E1EEB4] px-2 py-0.5 rounded-full mt-2 inline-block">
              Student Accounts
            </span>
          </div>
          <div className="p-3 bg-[#E1EEB4] rounded-2xl text-[#3B5B11] shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Account Status */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between border border-gray-100/60 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">ACCOUNT STATUS</span>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {activeStudents.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-[#3B5B11] bg-[#E1EEB4] px-2 py-0.5 rounded-full mt-2 inline-block">
              Active / 0 Suspended
            </span>
          </div>
          <div className="p-3 bg-[#E1EEB4] rounded-2xl text-[#3B5B11] shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Visual Analytics Section (2 Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Registration Growth */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">User Registration Growth</h3>
              <p className="text-[11px] text-gray-400 font-medium">New student sign-ups over the last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#88C425] bg-[#F8FBF2] px-2.5 py-1 rounded-xl">
              <TrendingUp className="w-4 h-4" />
              +24% Growth
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#88C425" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#88C425" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #F1F5F9', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                  }} 
                />
                <Area type="monotone" dataKey="signups" stroke="#88C425" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Role Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">User Role Distribution</h3>
            <p className="text-[11px] text-gray-400 font-medium">Proportion of platform credentials</p>
          </div>
          <div className="h-[180px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #F1F5F9', 
                    borderRadius: '12px',
                    fontSize: '11px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Users</span>
              <span className="text-xl font-black text-gray-900">
                {(totalUsers + totalAdminsCount + 1).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50 text-[10px] font-bold text-gray-500">
            {roleDistributionData.map((r) => (
              <div key={r.name} className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50">
                <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: r.color }} />
                <span>{r.name}</span>
                <span className="text-slate-900 font-black text-xs mt-0.5">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Quick Management Tables / Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Block: Recently Created Canteen Admins */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recently Created Canteen Admins</h3>
                <p className="text-[11px] text-gray-400 font-medium">Top active managers managing school canteens</p>
              </div>
              <button 
                onClick={() => navigate('/kitchen-admin')}
                className="text-xs font-bold text-[#88C425] hover:text-[#72A61E] transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-6">
                <div className="h-6 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-6 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-6 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 font-bold text-gray-400">
                      <th className="py-2.5">Admin Username</th>
                      <th className="py-2.5">Assigned Canteen</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-gray-600">
                    {recentAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-2.5 font-bold text-gray-900">{admin.adminId}</td>
                        <td className="py-2.5">{admin.restaurant}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-green-50 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => navigate('/kitchen-admin')}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px] text-gray-600 font-bold hover:bg-slate-100 transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recentAdmins.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400 font-medium">
                          No canteen admins found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Block: Canteen Allocation Overview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Canteen Allocation Overview</h3>
              <p className="text-[11px] text-gray-400 font-medium">Branches allocation map and assignments</p>
            </div>
            <button 
              onClick={() => navigate('/branches')}
              className="text-xs font-bold text-[#88C425] hover:text-[#72A61E] transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-6">
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3">
              {canteenAllocations.map((canteen) => (
                <div 
                  key={canteen.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 transition-all hover:bg-slate-50 hover:border-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E1EEB4]/50 border border-[#E1EEB4] flex items-center justify-center text-[#3B5B11] shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-none">{canteen.canteenName}</h4>
                      <span className="text-[10px] text-gray-400 font-medium mt-1 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        {canteen.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-extrabold text-gray-400 tracking-wider block">Assigned Admin</span>
                    <span className={`text-[11px] font-bold ${canteen.adminName === 'Unassigned' ? 'text-amber-600' : 'text-slate-800'}`}>
                      {canteen.adminName}
                    </span>
                  </div>
                </div>
              ))}
              {canteenAllocations.length === 0 && (
                <div className="py-8 text-center text-gray-400 font-medium text-xs">
                  No canteens allocated yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
