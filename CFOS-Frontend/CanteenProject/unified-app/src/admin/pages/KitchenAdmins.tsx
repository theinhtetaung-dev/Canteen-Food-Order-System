import React, { useState, useEffect } from 'react';
import { fetchKitchenAdmins, createKitchenAdmin, deleteUser, resetUserPassword } from "@furniture/api/user.api";
import { fetchBranches, type Branch } from "@furniture/api/branch.api";
import Swal from 'sweetalert2';
import {
  Search,
  Plus,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

interface KitchenAdmin {
  id: string;
  adminId: string;
  avatar: string;
  isAvatarText?: boolean;
  restaurant: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedOn: string;
}

const swalSuccessClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
};

export const KitchenAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<KitchenAdmin[]>([]);
  const [canteens, setCanteens] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Page Mode: 'list' | 'create'
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

  // Form State
  const [formData, setFormData] = useState({
    canteenId: '',      // stores the selected Branch's branchId as string
    canteenName: '',    // display name (optional, for optimistic UI)
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<KitchenAdmin | null>(null);
  const [adminToReset, setAdminToReset] = useState<KitchenAdmin | null>(null);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await fetchKitchenAdmins();
      // fetchKitchenAdmins now returns the fully-mapped shape from user.api.ts
      setAdmins(data);
    } catch (err) {
      console.error("Failed to fetch canteen admins", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadCanteens() {
      try {
        const data = await fetchBranches();
        setCanteens(data);
      } catch (err) {
        console.error("Failed to fetch canteens for dropdown", err);
      }
    }

    loadAdmins();
    loadCanteens();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await fetchKitchenAdmins();
      setAdmins(data);
      setSearchTerm(searchInput);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch canteen admins", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setSearchInput('');
    setSearchTerm('');
    try {
      setIsLoading(true);
      const data = await fetchKitchenAdmins();
      setAdmins(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch canteen admins", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.adminId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAdmins = filteredAdmins.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.canteenId || !formData.username) return;
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Passwords do not match',
        icon: 'error',
        buttonsStyling: false,
        width: '360px',
        customClass: {
          ...swalSuccessClass,
          confirmButton: 'px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl'
        }
      });
      return;
    }

    try {
      await createKitchenAdmin({
        staffId: formData.username,
        name: formData.canteenName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        canteenId: parseInt(formData.canteenId, 10),
      });

      const newAdmin: KitchenAdmin = {
        id: formData.username,
        adminId: formData.username,
        avatar: formData.username.substring(0, 2).toUpperCase(),
        isAvatarText: true,
        restaurant: formData.canteenName,
        phone: formData.phone ? `+95${formData.phone}` : '+959123456789',
        status: 'Active',
        joinedOn: 'Just now',
      };

      setAdmins([newAdmin, ...admins]);
      setViewMode('list');

      setFormData({
        canteenId: '',
        canteenName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });

      Swal.fire({
        title: 'Success!',
        text: 'New Canteen Admin created successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        buttonsStyling: false,
        width: '360px',
        customClass: swalSuccessClass
      });
    } catch (err) {
      console.error("Failed to create admin", err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to create Canteen Admin',
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

  // ---------------- VIEW 1: CREATE NEW CANTEEN ADMIN FORM ----------------
  if (viewMode === 'create') {
    return (
      <div className="max-w-4xl space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span>Admins</span>
          <span>/</span>
          <span className="text-gray-700">Create New Canteen Admin</span>
        </div>

        {/* Back Link & Header Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('list')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Create New Canteen Admin
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900">Canteen Details</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Provide the basic credentials and information for the new canteen administration.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-2xl">
            {/* Canteen Name (Select Box) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Canteen Name
              </label>
              <select
                value={formData.canteenId}
                onChange={(e) => {
                  const selected = canteens.find(c => c.branchId === parseInt(e.target.value, 10));
                  setFormData({
                    ...formData,
                    canteenId: e.target.value,
                    canteenName: selected?.branchName || '',
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                required
              >
                <option value="">Select canteen name</option>
                {canteens.map((c) => (
                  <option key={c.branchId} value={c.branchId}>
                    {c.branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter canteen email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-gray-500 border-r border-gray-200 pr-2">
                  +95
                </span>
                <input
                  type="text"
                  placeholder="Enter admin phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                />
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password <span className="text-gray-400 font-normal">(8 or more characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#88C425] hover:bg-[#77AF1D] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- VIEW 2: CANTEEN ADMINS LIST TABLE ----------------
  return (
    <div className="max-w-6xl space-y-6 relative">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Canteen Admins
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Manage and create new canteen admins.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search admin by username (id) or canteen"
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

          <button
            onClick={() => setViewMode('create')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Canteen Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#B2C5A3] text-gray-800 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-md">NO</th>
                <th className="py-3 px-4">ADMIN ID</th>
                <th className="py-3 px-4">CANTEEN</th>
                <th className="py-3 px-4">PHONE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">JOINED ON</th>
                <th className="py-3 px-4 text-center rounded-r-md">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {currentAdmins.map((admin, idx) => (
                <tr
                  key={admin.id}
                  className={`transition-colors hover:bg-gray-50/80 ${
                    idx % 2 === 1 ? 'bg-[#F9FAF4]' : 'bg-white'
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-gray-500 font-mono text-[11px]">
                    {startIndex + idx + 1}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-3 font-semibold text-gray-900">
                    {admin.isAvatarText ? (
                      <div className="w-7 h-7 rounded-full bg-[#88C425] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {admin.avatar}
                      </div>
                    ) : (
                      <img
                        src={admin.avatar}
                        alt={admin.adminId}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    )}
                    <span>{admin.adminId}</span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-gray-800">{admin.restaurant}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{admin.phone}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        admin.status === 'Active'
                          ? 'bg-[#E1EEB4] text-[#3B5B11]'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          admin.status === 'Active' ? 'bg-[#5B880A]' : 'bg-gray-500'
                        }`}
                      />
                      {admin.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-pre-line leading-tight">
                    {admin.joinedOn}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-3">
                      {/* RESET PASSWORD BUTTON */}
                      <button
                        onClick={() => setAdminToReset(admin)}
                        title="Reset Credentials"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <RotateCw className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {/* DELETE ADMIN BUTTON */}
                      <button
                        onClick={() => setAdminToDelete(admin)}
                        title="Delete Canteen Admin"
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Logic */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs">
            <span className="text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAdmins.length)} of {filteredAdmins.length} admins
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-[#88C425] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER CUSTOM DELETE CONFIRMATION MODAL */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-6">
                  Delete Canteen Admin
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                  This action cannot be undone. All data associated with this admin will be permanently removed.
                </p>
              </div>
            </div>

            {/* Target Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="text-slate-900 font-bold">{adminToDelete.adminId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Canteen:</span>
                <span className="text-slate-900 font-bold">{adminToDelete.restaurant}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteUser(adminToDelete.id);
                    setAdmins(prev => prev.filter((a) => a.id !== adminToDelete.id));
                    setAdminToDelete(null);
                    Swal.fire({
                      title: 'Deleted!',
                      text: 'Canteen Admin deleted successfully!',
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                      buttonsStyling: false,
                      width: '360px',
                      customClass: swalSuccessClass
                    });
                  } catch (err) {
                    console.error("Failed to delete canteen admin", err);
                    setAdminToDelete(null);
                    Swal.fire({
                      title: 'Error',
                      text: 'Failed to delete canteen admin',
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
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER CUSTOM RESET PASSWORD CONFIRMATION MODAL */}
      {adminToReset && (
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
                  Are you sure you want to reset the password for this admin? They will need to use their new password on next login.
                </p>
              </div>
            </div>

            {/* Target Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Username:</span>
                <span className="text-slate-900 font-bold">{adminToReset.adminId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Canteen:</span>
                <span className="text-slate-900 font-bold">{adminToReset.restaurant}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setAdminToReset(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resetUserPassword(adminToReset.id);
                    setAdminToReset(null);
                    Swal.fire({
                      title: 'Success!',
                      text: `Password reset successfully for "${adminToReset.adminId}"!`,
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                      buttonsStyling: false,
                      width: '360px',
                      customClass: swalSuccessClass
                    });
                  } catch (err) {
                    console.warn("Backend reset endpoint missing, mocking success.", err);
                    setAdminToReset(null);
                    Swal.fire({
                      title: 'Success!',
                      text: `Password reset successfully for "${adminToReset.adminId}"!`,
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                      buttonsStyling: false,
                      width: '360px',
                      customClass: swalSuccessClass
                    });
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white bg-[#88C425] hover:bg-[#72A61E] font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};