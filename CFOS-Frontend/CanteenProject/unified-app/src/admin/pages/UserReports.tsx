import React, { useState, useEffect, useMemo } from 'react';
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy';
import {
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Users,
  CheckCircle2,
  Building2,
  Calendar,
  RefreshCw,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { fetchAllUsers, type ReportUser } from "@furniture/api/user.api";
import { fetchBranches, type Branch } from "@furniture/api/branch.api";
import Swal from 'sweetalert2';

// Standardized SweetAlert2 classes matching the Campus Bites theme
const swalAlertClass = {
  popup: 'rounded-2xl border border-slate-200 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
  confirmButton: 'px-5 py-2.5 bg-[#7ca038] hover:bg-[#68872e] text-white text-xs font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20',
};

export const UserReports: React.FC = () => {
  // Raw Data States
  const [dbUsers, setDbUsers] = useState<ReportUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter UI States
  const [reportType, setReportType] = useState<string>('1');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL_TIME');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');

  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch Data on Load
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, branchesData] = await Promise.all([
        fetchAllUsers(),
        fetchBranches(),
      ]);
      setDbUsers(usersData);
      setBranches(branchesData);
    } catch (error) {
      console.error("Failed to load reporting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Generate Report action
  const handleGenerateReport = () => {
    setAppliedSearch(searchInput);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Perform client-side filtering based on panel inputs
  const filteredUsers = useMemo<ReportUser[]>(() => {
    return dbUsers.filter(u => {
      // 1. Live Search filter
      if (appliedSearch.trim() !== '') {
        const query = appliedSearch.toLowerCase();
        const matchesSearch =
          u.userName.toLowerCase().includes(query) ||
          u.fullName.toLowerCase().includes(query) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.phoneNumber && u.phoneNumber.includes(query));
        if (!matchesSearch) return false;
      }

      // 2. Role Filter mapping: Canteen Admin -> Manager, Student -> User, Super Admin -> Admin
      if (roleFilter !== 'ALL') {
        const mappedRole =
          roleFilter === 'CANTEEN_ADMIN' ? 'Manager' :
          roleFilter === 'STUDENT' ? 'User' :
          roleFilter === 'SUPER_ADMIN' ? 'Admin' : '';
        if (u.roleName.toLowerCase() !== mappedRole.toLowerCase()) return false;
      }

      // 3. Status Filter: mapping Active, Suspended, Inactive
      if (statusFilter !== 'ALL') {
        const isSuspended = u.deleteFlag;
        const isActive = u.status === 'ACTIVE' && !u.deleteFlag;
        const isInactive = u.status === 'INACTIVE' && !u.deleteFlag;

        if (statusFilter === 'ACTIVE' && !isActive) return false;
        if (statusFilter === 'SUSPENDED' && !isSuspended) return false;
        if (statusFilter === 'INACTIVE' && !isInactive) return false;
      }

      // 4. Report Type Specific Filters
      if (reportType === '2') {
        // Canteen Admin Allocation Report (Managers/Admins assigned to canteens)
        if (u.roleName.toLowerCase() !== 'manager' && u.roleName.toLowerCase() !== 'admin') return false;
      } else if (reportType === '4') {
        // Account Status & Security Audit Report (Active, Suspended, Inactive Accounts)
        // No hard filtration, but layout will highlight status metrics
      }

      // 5. Date Range Filter
      if (dateRangeFilter !== 'ALL_TIME') {
        const userDate = new Date(u.createdAt);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // end of today

        if (dateRangeFilter === 'TODAY') {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (userDate < startOfToday || userDate > today) return false;
        } else if (dateRangeFilter === 'LAST_7_DAYS') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          if (userDate < sevenDaysAgo || userDate > today) return false;
        } else if (dateRangeFilter === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          thirtyDaysAgo.setHours(0, 0, 0, 0);
          if (userDate < thirtyDaysAgo || userDate > today) return false;
        } else if (dateRangeFilter === 'CUSTOM' && startDate) {
          const customStart = new Date(startDate);
          customStart.setHours(0, 0, 0, 0);
          const customEnd = endDate ? new Date(endDate) : new Date();
          customEnd.setHours(23, 59, 59, 999);
          if (userDate < customStart || userDate > customEnd) return false;
        }
      }

      return true;
    });
  }, [dbUsers, appliedSearch, roleFilter, statusFilter, reportType, dateRangeFilter, startDate, endDate]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = filteredUsers.length;
    const activeStudents = filteredUsers.filter(u => u.roleName.toLowerCase() === 'user' && u.status === 'ACTIVE' && !u.deleteFlag).length;
    const assignedAdmins = filteredUsers.filter(u => u.roleName.toLowerCase() === 'manager' && u.canteenId !== null).length;
    const suspended = filteredUsers.filter(u => u.deleteFlag || u.status === 'INACTIVE').length;

    return {
      total,
      activeStudents,
      assignedAdmins,
      suspended,
    };
  }, [filteredUsers]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      Swal.fire({
        ...swalAlertClass,
        icon: 'warning',
        title: 'No Data Available',
        text: 'There are no records matching your current filter criteria to export.'
      });
      return;
    }

    const headers = ['No', 'Username', 'Full Name', 'Role', 'Status', 'Canteen', 'Email', 'Phone', 'Joined Date'];
    const rows = filteredUsers.map((u, idx) => {
      const statusStr = u.deleteFlag ? 'Suspended' : u.status === 'ACTIVE' ? 'Active' : 'Inactive';
      return [
        idx + 1,
        `@${u.userName}`,
        u.fullName,
        u.roleName === 'Manager' ? 'Canteen Admin' : u.roleName === 'Admin' ? 'Super Admin' : 'Student',
        statusStr,
        u.canteenName || '—',
        u.email || '—',
        u.phoneNumber || '—',
        new Date(u.createdAt).toLocaleDateString()
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `User_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      ...swalAlertClass,
      icon: 'success',
      title: 'Export Complete',
      text: `Successfully exported ${filteredUsers.length} user records to CSV.`
    });
  };

  // Export Excel (.xlsx) mock / tab-separated download
  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      Swal.fire({
        ...swalAlertClass,
        icon: 'warning',
        title: 'No Data Available',
        text: 'There are no records matching your current filter criteria to export.'
      });
      return;
    }

    // Creating an Excel-compatible XML formatted workbook or simple TSV file to make sure it opens cleanly
    const headers = ['No', 'Username', 'Full Name', 'Role', 'Status', 'Canteen', 'Email', 'Phone', 'Joined Date'];
    const rows = filteredUsers.map((u, idx) => {
      const statusStr = u.deleteFlag ? 'Suspended' : u.status === 'ACTIVE' ? 'Active' : 'Inactive';
      return [
        idx + 1,
        `@${u.userName}`,
        u.fullName,
        u.roleName === 'Manager' ? 'Canteen Admin' : u.roleName === 'Admin' ? 'Super Admin' : 'Student',
        statusStr,
        u.canteenName || '—',
        u.email || '—',
        u.phoneNumber || '—',
        new Date(u.createdAt).toLocaleDateString()
      ];
    });

    const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `User_Report_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      ...swalAlertClass,
      icon: 'success',
      title: 'Excel Export Complete',
      text: `Successfully generated Excel (.xls) file with ${filteredUsers.length} rows.`
    });
  };

  // Trigger Native Print / PDF Download
  const handlePrint = () => {
    window.print();
  };

  // React Table Columns setup
  const columns = useMemo<ColumnDef<ReportUser>[]>(() => [
    {
      id: 'serialNo',
      header: () => <span className="uppercase font-extrabold text-[11px]">No</span>,
      cell: ({ row }) => {
        const pageIndex = pagination.pageIndex;
        const pageSize = pagination.pageSize;
        return <span className="font-mono text-slate-500 font-semibold">{(pageIndex * pageSize) + row.index + 1}</span>;
      },
    },
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-slate-900 transition-colors uppercase font-extrabold text-[11px]"
        >
          Full Name
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900 text-sm leading-snug">{row.original.fullName}</div>
          <div className="text-xs text-[#7ca038] font-medium mt-0.5">@{row.original.userName}</div>
        </div>
      ),
    },
    {
      accessorKey: 'roleName',
      header: () => <span className="uppercase font-extrabold text-[11px]">Role</span>,
      cell: ({ row }) => {
        const role = row.original.roleName;
        if (role === 'Admin') {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
              Super Admin
            </span>
          );
        } else if (role === 'Manager') {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F2F7E6] text-[#3B5B11] border border-[#E1EEB4] shadow-sm">
              Canteen Admin
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
              Student
            </span>
          );
        }
      },
    },
    {
      accessorKey: 'canteenName',
      header: () => <span className="uppercase font-extrabold text-[11px]">Assigned Canteen</span>,
      cell: ({ row }) => (
        <span className="text-slate-700 font-semibold">{row.original.canteenName || '—'}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: () => <span className="uppercase font-extrabold text-[11px]">Contact (Email / Phone)</span>,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="text-slate-800 font-medium truncate max-w-[190px]" title={row.original.email || ''}>
            {row.original.email || '—'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono font-medium">
            {row.original.phoneNumber || '—'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <span className="uppercase font-extrabold text-[11px]">Status</span>,
      cell: ({ row }) => {
        const isSuspended = row.original.deleteFlag;
        const isActive = row.original.status === 'ACTIVE' && !row.original.deleteFlag;

        if (isActive) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E1EEB4] text-[#3B5B11] border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B880A]" />
              Active
            </span>
          );
        } else if (isSuspended) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Suspended
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Inactive
            </span>
          );
        }
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-slate-900 transition-colors uppercase font-extrabold text-[11px]"
        >
          Joined Date
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500 font-semibold">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ], [pagination]);

  // React Table initialization
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6 relative max-w-7xl">
      
      {/* 1. Header (hidden during print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            User Management Reports
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Access secure audit reports, canteen admin allocations, and user growth analytics.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white rounded-xl shadow-xs transition-all hover:bg-slate-50 text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* 2. Filter & Report Selection Panel (hidden during print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 print:hidden">
        
        {/* Row 1: Report Selection & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                // Auto-reset filters for specific report requirements if necessary
                if (e.target.value === '2') {
                  setRoleFilter('CANTEEN_ADMIN'); // Focus on managers
                } else {
                  setRoleFilter('ALL');
                }
              }}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:border-[#7ca038] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="1">1. User Directory Master Report (All Users)</option>
              <option value="2">2. Canteen Admin Allocation Report</option>
              <option value="3">3. User Registration Growth Report</option>
              <option value="4">4. Account Status & Security Audit Report</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Live Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by username, full name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateReport()}
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#7ca038] transition-all bg-slate-50/50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Filters & Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-1 border-t border-slate-100">
          
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:outline-none focus:border-[#7ca038] transition-all cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="CANTEEN_ADMIN">Canteen Admin</option>
              <option value="STUDENT">Student</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:outline-none focus:border-[#7ca038] transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Date Range</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:outline-none focus:border-[#7ca038] transition-all cursor-pointer"
            >
              <option value="ALL_TIME">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Conditional Custom Date Inputs */}
          {dateRangeFilter === 'CUSTOM' ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Start</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#7ca038]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">End</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#7ca038]"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                className="w-full py-2.5 bg-[#7ca038] hover:bg-[#68872e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 hover:shadow-md cursor-pointer"
              >
                <Filter className="w-4 h-4" />
                Generate User Report
              </button>
            </div>
          )}
        </div>

        {dateRangeFilter === 'CUSTOM' && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleGenerateReport}
              className="px-6 py-2 bg-[#7ca038] hover:bg-[#68872e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              Generate User Report
            </button>
          </div>
        )}
      </div>

      {/* 3. KPI Overview Bar (Appears above table based on filters) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : kpis.total}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Accounts Found</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-blue-50/70 text-blue-600 rounded-xl border border-blue-50">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : kpis.activeStudents}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Active Students</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-[#F2F7E6] text-[#3B5B11] rounded-xl border border-[#E1EEB4]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : kpis.assignedAdmins}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Assigned Canteen Admins</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {isLoading ? '...' : kpis.suspended}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Flagged / Suspended</div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Data Preview Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 print:hidden">
        
        {/* Table Header: Controls & Exports */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base leading-none">
              {reportType === '1' ? 'User Directory Master List' :
               reportType === '2' ? 'Canteen Admin Allocation Directory' :
               reportType === '3' ? 'User Registration Growth Log' :
               'Security Audit Account Log'}
            </h3>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">
              Showing preview database records (10 rows per page)
            </span>
          </div>

          {/* Export Actions Panel */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Download clean CSV"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Download Excel spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#7ca038] hover:bg-[#68872e] text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
              title="Download PDF or Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Audit</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-[#F2F7E6] text-slate-800 text-[11px] font-extrabold uppercase tracking-wider border-b border-[#E1EEB4]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-3.5 px-4 font-extrabold select-none">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-500 font-bold">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#7ca038]" />
                      <span>Fetching secure audit database reports...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-slate-400 font-extrabold">
                    <div className="flex flex-col items-center gap-2.5">
                      <ShieldAlert className="w-8 h-8 text-amber-500" />
                      <div>No users match the current filter criteria.</div>
                      <button
                        onClick={() => {
                          setRoleFilter('ALL');
                          setStatusFilter('ALL');
                          setDateRangeFilter('ALL_TIME');
                          setSearchInput('');
                          setAppliedSearch('');
                          setReportType('1');
                        }}
                        className="text-xs text-[#7ca038] hover:underline font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition-all hover:bg-slate-50/80 ${
                      idx % 2 === 1 ? 'bg-[#FBFDF8]' : 'bg-white'
                    }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-3.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs print:hidden">
            <span className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredUsers.length
                )}
              </span> of <span className="font-bold text-slate-800">{filteredUsers.length}</span> user records
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: table.getPageCount() }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(i)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    table.getState().pagination.pageIndex === i
                      ? "bg-[#7ca038] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Print-Only Beautiful Layout (visible ONLY during print output) */}
      <div className="hidden print:block font-sans text-slate-800 p-8 space-y-6">
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Campus Bites Canteen System</h1>
            <h2 className="text-lg font-bold text-[#3B5B11] mt-1">USER SECURITY & ACCESS AUDIT REPORT</h2>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Document generated on {new Date().toLocaleString()} by System Administrator.
            </div>
          </div>
          <div className="text-right text-xs space-y-1 font-semibold text-slate-600">
            <div>Report Type: {
              reportType === '1' ? 'User Directory Master' :
              reportType === '2' ? 'Canteen Admin Allocation' :
              reportType === '3' ? 'User Registration Growth' :
              'Account Status Audit'
            }</div>
            <div>Role Filter: {roleFilter}</div>
            <div>Status Filter: {statusFilter}</div>
            <div>Date Range: {dateRangeFilter}</div>
          </div>
        </div>

        {/* Print KPIs */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Total Accounts</div>
            <div className="text-xl font-bold text-slate-900">{kpis.total}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Active Students</div>
            <div className="text-xl font-bold text-slate-900">{kpis.activeStudents}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Allocated Admins</div>
            <div className="text-xl font-bold text-slate-900">{kpis.assignedAdmins}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Suspended / Flagged</div>
            <div className="text-xl font-bold text-slate-900">{kpis.suspended}</div>
          </div>
        </div>

        {/* Print Table */}
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <th className="py-2.5 px-3 border-r border-slate-300">No</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Username</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Full Name</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Role</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Canteen Assignment</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Email</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Phone</th>
              <th className="py-2.5 px-3 border-r border-slate-300">Status</th>
              <th className="py-2.5 px-3">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((u, idx) => {
              const statusStr = u.deleteFlag ? 'Suspended' : u.status === 'ACTIVE' ? 'Active' : 'Inactive';
              return (
                <tr key={u.userId} className="border-b border-slate-200">
                  <td className="py-2 px-3 border-r border-slate-300 font-mono text-[10px]">{idx + 1}</td>
                  <td className="py-2 px-3 border-r border-slate-300">@{u.userName}</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{u.fullName}</td>
                  <td className="py-2 px-3 border-r border-slate-300">{u.roleName}</td>
                  <td className="py-2 px-3 border-r border-slate-300">{u.canteenName || '—'}</td>
                  <td className="py-2 px-3 border-r border-slate-300 truncate max-w-[130px]">{u.email || '—'}</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-mono text-[10px]">{u.phoneNumber || '—'}</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{statusStr}</td>
                  <td className="py-2 px-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Print Footer */}
        <div className="pt-8 border-t border-slate-300 flex justify-between text-[10px] text-slate-400 font-bold uppercase">
          <span>Campus Bites Security Division</span>
          <span>Confidential - For Internal Use Only</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

    </div>
  );
};
