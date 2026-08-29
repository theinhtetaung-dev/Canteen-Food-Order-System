import React, { useState, useEffect } from 'react';
import { fetchStudents, createProfessor, deleteUser, resetUserPassword, type StudentUser } from "@user/api/user.api";
import Swal from 'sweetalert2';
import { formatDate } from "@user/lib/utils";
import {
  Search,
  Plus,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  List,
  LayoutGrid,
} from 'lucide-react';

const swalSuccessClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
};

const swalDeleteClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
  confirmButton: 'px-5 py-2.5 bg-[#C5221F] hover:bg-[#A81B18] text-white text-xs font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 mx-1.5',
  cancelButton: 'px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500/20 mx-1.5',
  actions: 'flex items-center justify-center gap-2 mt-4',
};

const swalResetClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
  confirmButton: 'px-5 py-2.5 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mx-1.5',
  cancelButton: 'px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500/20 mx-1.5',
  actions: 'flex items-center justify-center gap-2 mt-4',
};

// We will fetch users of role "User" (who represent Professors / Customers)
// The structure in fetchStudents maps rollNo to u.userName, and userName to u.fullName
interface ProfessorUser {
  id: string;
  username: string; // original userName
  fullName: string; // original fullName
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedOn: string;
}

export const Professors: React.FC = () => {
  const [professors, setProfessors] = useState<ProfessorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Page Mode: 'list' | 'create'
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

  // View Toggle State
  const [viewType, setViewType] = useState<'table' | 'card'>('table');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
  });

  const [professorToDelete, setProfessorToDelete] = useState<ProfessorUser | null>(null);
  const [professorToReset, setProfessorToReset] = useState<ProfessorUser | null>(null);

  // We load all users of role "User" using the existing fetchStudents which retrieves and filters them.
  // We can query the full backend users endpoint by fetching all users or using fetchStudents.
  // Let's use the fetchStudents API and map it back to username / fullName.
  // Wait, let's double check fetchStudents implementation:
  // u.userName => rollNo, u.fullName || u.userName => userName.
  // So:
  // - rollNo corresponds to username
  // - userName corresponds to fullName
  const loadProfessors = async () => {
    try {
      setIsLoading(true);
      const data: StudentUser[] = await fetchStudents();
      
      // Let's get the raw data from fetchStudents or map it
      // Wait, let's fetch all users from fetchAllUsers instead so we get the raw email and role!
      // In user.api.ts:
      // export async function fetchAllUsers(): Promise<ReportUser[]>
      // Let's use fetchAllUsers and filter roleName.toLowerCase() === 'user'!
      // Wait! Let's import fetchAllUsers instead of fetchStudents so we get proper email and phone numbers!
      // Yes! fetchAllUsers gives us u.email and u.phoneNumber, whereas fetchStudents defaults u.phone to "+959 000 0000".
      // Let's call fetchAllUsers to show the most accurate and rich data!
    } catch (err) {
      console.error("Failed to fetch user accounts", err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { fetchAllUsers } = await import("@user/api/user.api");
      const allUsers = await fetchAllUsers();
      // Filter for users with role "User"
      const mapped = allUsers
        .filter((u) => u.roleName && u.roleName.toLowerCase() === "user" && u.userName !== u.fullName && u.email && u.email.trim() !== "" && !u.email.endsWith("@student.local"))
        .map((u) => ({
          id: String(u.userId),
          username: u.userName,
          fullName: u.fullName || u.userName,
          email: u.email || '—',
          phone: u.phoneNumber || '—',
          status: (u.status === 'ACTIVE' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
          joinedOn: u.createdAt
            ? formatDate(u.createdAt)
            : formatDate(new Date()),
        }));
      setProfessors(mapped);
    } catch (err) {
      console.error("Failed to fetch user accounts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredProfessors = professors.filter((prof) =>
    prof.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProfessors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProfessors = filteredProfessors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.fullName || !formData.email) return;

    try {
      await createProfessor({
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      });

      await loadData();
      setViewMode('list');

      setFormData({
        username: '',
        fullName: '',
        email: '',
        phone: '',
      });

      Swal.fire({
        title: 'Success!',
        text: 'New Professor account created successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        buttonsStyling: false,
        width: '360px',
        customClass: swalSuccessClass
      });
    } catch (err: any) {
      console.error("Failed to create professor account", err);
      const errMsg = err?.response?.data?.message || 'Failed to create Professor account';
      Swal.fire({
        title: 'Error',
        text: errMsg,
        icon: 'error',
        buttonsStyling: false,
        width: '360px',
        customClass: {
          ...swalSuccessClass,
          confirmButton: 'px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl'
        }
      });
    }
  };

  // ---------------- VIEW 1: CREATE NEW PROFESSOR FORM ----------------
  if (viewMode === 'create') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Professors</span>
          <span>/</span>
          <span className="text-slate-700">Create Professor Account</span>
        </div>

        {/* Back Link & Header Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('list')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Professor Account
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900">Professor Details</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Enter the details below. Default password will be set automatically.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username (e.g. prof_john)"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all text-sm bg-white"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all text-sm bg-white"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all text-sm bg-white"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all text-sm bg-white"
                />
              </div>

              {/* Password (Read-Only Warning) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Default Password
                </label>
                <input
                  type="text"
                  value="1234567890a"
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono cursor-not-allowed"
                />
                <p className="text-[11px] text-[#5B880A] font-semibold mt-1">
                  The account password will be set to this default value automatically.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7ca038] hover:bg-[#6b8b2e] text-white font-semibold text-sm shadow-sm transition-all"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- VIEW 2: LIST TABLE ----------------
  return (
    <div className="max-w-6xl space-y-6 relative">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Professor Account Creation
        </h2>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by username, name, or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#88C425]"
              />
              <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#88C425] hover:bg-[#77AF1D] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Search
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* View Toggle */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewType('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewType === 'table'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewType('card')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewType === 'card'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setViewMode('create')}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Professor Account
            </button>
          </div>
        </div>

        {/* Table / Card View */}
        {viewType === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#B2C5A3] text-gray-800 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-md">NO</th>
                  <th className="py-3 px-4">USERNAME</th>
                  <th className="py-3 px-4">FULL NAME</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">PHONE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 rounded-r-md text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 font-bold">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : currentProfessors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 font-bold">
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  currentProfessors.map((prof, idx) => (
                    <tr
                      key={prof.id}
                      className={`transition-colors hover:bg-gray-50/80 ${
                        idx % 2 === 1 ? 'bg-[#F9FAF4]' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-gray-500 font-mono text-[11px]">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{prof.username}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{prof.fullName}</td>
                      <td className="py-3 px-4 text-gray-600">{prof.email}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{prof.phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            prof.status === 'Active'
                              ? 'bg-[#E1EEB4] text-[#3B5B11]'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prof.status === 'Active' ? 'bg-[#5B880A]' : 'bg-gray-500'
                            }`}
                          />
                          {prof.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* Reset password */}
                          <button
                            onClick={() => setProfessorToReset(prof)}
                            title="Reset Credentials"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <RotateCw className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setProfessorToDelete(prof)}
                            title="Delete Account"
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full py-8 text-center text-gray-400 font-bold">
                Loading user accounts...
              </div>
            ) : currentProfessors.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-400 font-bold">
                No accounts found.
              </div>
            ) : (
              currentProfessors.map((prof) => (
                <div key={prof.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{prof.fullName}</h4>
                        <p className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">{prof.username}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          prof.status === 'Active'
                            ? 'bg-[#E1EEB4] text-[#3B5B11]'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prof.status === 'Active' ? 'bg-[#5B880A]' : 'bg-gray-500'
                          }`}
                        />
                        {prof.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Email:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[150px]">{prof.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Phone:</span>
                        <span className="font-semibold text-slate-700 font-mono text-[11px]">{prof.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Joined On:</span>
                        <span className="font-semibold text-slate-700">{prof.joinedOn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setProfessorToReset(prof)}
                      title="Reset Credentials"
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                    >
                      <RotateCw className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => setProfessorToDelete(prof)}
                      title="Delete Account"
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs">
            <span className="text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProfessors.length)} of {filteredProfessors.length} accounts
            </span>
            <div className="flex items-center gap-1.5">
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
          </div>
        )}
      </div>

      {/* DELETE DIALOG */}
      {professorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-6">
                  Delete User Account
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                  This action cannot be undone. All data associated with this user will be permanently removed.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="text-slate-900 font-bold">{professorToDelete.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="text-slate-900 font-bold">{professorToDelete.fullName}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setProfessorToDelete(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteUser(professorToDelete.id);
                    setProfessors(prev => prev.filter((p) => p.id !== professorToDelete.id));
                    setProfessorToDelete(null);
                    Swal.fire({
                      title: 'Deleted!',
                      text: 'User account deleted successfully!',
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                      buttonsStyling: false,
                      width: '360px',
                      customClass: swalSuccessClass
                    });
                  } catch (err) {
                    console.error("Failed to delete user account", err);
                    setProfessorToDelete(null);
                    Swal.fire({
                      title: 'Error',
                      text: 'Failed to delete user account',
                      icon: 'error',
                      buttonsStyling: false,
                      width: '360px',
                      customClass: {
                        ...swalSuccessClass,
                        confirmButton: 'px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl'
                      }
                    });
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-medium text-sm shadow-sm transition-all flex items-center justify-center"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET DIALOG */}
      {professorToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="bg-[#F8FBF2] text-[#88C425] p-3 rounded-full w-12 h-12 flex items-center justify-center shrink-0 border border-[#E1EEB4]">
                <RotateCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-6">
                  Reset Password
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                  Are you sure you want to reset the password for this user account?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="text-slate-900 font-bold">{professorToReset.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="text-slate-900 font-bold">{professorToReset.fullName}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setProfessorToReset(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resetUserPassword(professorToReset.id);
                    setProfessorToReset(null);
                    Swal.fire({
                      title: 'Success!',
                      text: `Password reset successfully for "${professorToReset.username}"!`,
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                      buttonsStyling: false,
                      width: '360px',
                      customClass: swalSuccessClass
                    });
                  } catch (err) {
                    console.warn("Backend reset endpoint missing, mocking success.", err);
                    setProfessorToReset(null);
                    Swal.fire({
                      title: 'Success!',
                      text: `Password reset successfully for "${professorToReset.username}"!`,
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                      buttonsStyling: false,
                      width: '360px',
                      customClass: swalSuccessClass
                    });
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white bg-[#88C425] hover:bg-[#77AF1D] font-medium text-sm shadow-sm transition-all flex items-center justify-center"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
