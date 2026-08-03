import React, { useState } from 'react';
import {
  Search,
  Plus,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
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

const initialAdmins: KitchenAdmin[] = [
  {
    id: '1',
    adminId: 'C4-Kitchen-Admin',
    avatar: 'K2',
    isAvatarText: true,
    restaurant: 'Canteen 4',
    phone: '+959123456789',
    status: 'Active',
    joinedOn: 'July 10, 2026\n1:45 PM',
  },
  {
    id: '2',
    adminId: 'C2-Kitchen-Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    restaurant: 'Canteen 2',
    phone: '+959123456789',
    status: 'Active',
    joinedOn: 'Jun 26, 2026\n8:45 AM',
  },
  {
    id: '3',
    adminId: 'C3-Kitchen-Admin',
    avatar: 'K2',
    isAvatarText: true,
    restaurant: 'Canteen 3',
    phone: '+959123456789',
    status: 'Active',
    joinedOn: 'Jun 14, 2026\n11:45 AM',
  },
  {
    id: '4',
    adminId: 'C5-Kitchen-Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    restaurant: 'Canteen 5',
    phone: '+959123456789',
    status: 'Inactive',
    joinedOn: 'May 12, 2026\n10:45 AM',
  },
  {
    id: '5',
    adminId: 'C6-Kitchen-Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    restaurant: 'Canteen 6',
    phone: '+959123456789',
    status: 'Inactive',
    joinedOn: 'May 12, 2026\n10:45 AM',
  },
  {
    id: '6',
    adminId: 'C7-Kitchen-Admin',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100',
    restaurant: 'Canteen 7',
    phone: '+959123456789',
    status: 'Inactive',
    joinedOn: 'May 12, 2026\n10:45 AM',
  },
  {
    id: '7',
    adminId: 'C8-Kitchen-Admin',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100',
    restaurant: 'Canteen 8',
    phone: '+959123456789',
    status: 'Inactive',
    joinedOn: 'May 12, 2026\n10:45 AM',
  },
  {
    id: '8',
    adminId: 'C9-Kitchen-Admin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100',
    restaurant: 'Canteen 9',
    phone: '+959123456789',
    status: 'Active',
    joinedOn: 'May 12, 2026\n10:45 AM',
  },
];

export const KitchenAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<KitchenAdmin[]>(initialAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Page Mode: 'list' | 'create'
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

  // Modal states
  const [adminToDelete, setAdminToDelete] = useState<KitchenAdmin | null>(null);
  const [adminToReset, setAdminToReset] = useState<KitchenAdmin | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    canteenName: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const filteredAdmins = admins.filter((admin) =>
    admin.adminId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDeleteConfirm = () => {
    if (adminToDelete) {
      setAdmins(admins.filter((a) => a.id !== adminToDelete.id));
      setAdminToDelete(null);
      triggerToast('Kitchen Admin deleted successfully!');
    }
  };

  const handleResetPasswordConfirm = () => {
    if (adminToReset) {
      // Logic for password reset back-end API call goes here
      setAdminToReset(null);
      triggerToast(`Password reset successfully for ${adminToReset.restaurant}!`);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.canteenName || !formData.username) return;

    const newAdmin: KitchenAdmin = {
      id: Date.now().toString(),
      adminId: `${formData.username}-Admin`,
      avatar: formData.canteenName.substring(0, 2).toUpperCase(),
      isAvatarText: true,
      restaurant: formData.canteenName,
      phone: formData.phone ? `+95${formData.phone}` : '+959123456789',
      status: 'Active',
      joinedOn: 'Just now',
    };

    setAdmins([newAdmin, ...admins]);
    setViewMode('list');

    setFormData({
      canteenName: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });

    triggerToast('New canteen created successfully!');
  };

  // ---------------- VIEW 1: CREATE NEW CANTEEN FORM ----------------
  if (viewMode === 'create') {
    return (
      <div className="max-w-4xl space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span>Admins</span>
          <span>/</span>
          <span className="text-gray-700">Create New Canteen</span>
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
            Create New Canteen
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
            {/* Canteen Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Canteen Name
              </label>
              <input
                type="text"
                placeholder="Enter canteen name"
                value={formData.canteenName}
                onChange={(e) => setFormData({ ...formData, canteenName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                required
              />
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

  // ---------------- VIEW 2: KITCHEN ADMINS LIST TABLE ----------------
  return (
    <div className="max-w-6xl space-y-6 relative">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Kitchen Admins
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Manage and create new canteen's kitchen admins.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search admin by username (id)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#88C425]"
            />
            <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setViewMode('create')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#B2C5A3] text-gray-800 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-md">ADMIN ID</th>
                <th className="py-3 px-4">RESTAURANT</th>
                <th className="py-3 px-4">PHONE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">JOINED ON</th>
                <th className="py-3 px-4 text-center rounded-r-md">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredAdmins.map((admin, idx) => (
                <tr
                  key={admin.id}
                  className={`transition-colors hover:bg-gray-50/80 ${
                    idx % 2 === 1 ? 'bg-[#F9FAF4]' : 'bg-white'
                  }`}
                >
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
                        title="Delete Admin"
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

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pt-3 text-xs font-bold text-gray-600">
          <button className="p-1 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-6 h-6 rounded-md bg-[#E1EEB4] text-[#3B5B11] flex items-center justify-center font-bold">
            1
          </button>
          <button className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">2</button>
          <button className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">3</button>
          <span className="px-1 text-gray-400">......</span>
          <button className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">10</button>
          <button className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">11</button>
          <button className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">12</button>
          <button className="p-1 hover:text-gray-900 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RESET PASSWORD MODAL */}
      {adminToReset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              {/* Blue Alert Icon */}
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-blue-600">Reset Password ?</h3>

              {/* Message */}
              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                Are you sure you want to reset password for <br />
                <span className="font-bold text-gray-900">"{adminToReset.restaurant}"</span>?
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setAdminToReset(null)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPasswordConfirm}
                  className="px-5 py-2 bg-[#4263EB] hover:bg-[#3651C9] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Bottom Warning Banner */}
            <div className="bg-[#F3F4ED] py-2.5 px-4 flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase text-gray-500 border-t border-gray-200/50">
              <Info className="w-3.5 h-3.5" />
              <span>THIS ACTION CAN'T BE UNDO</span>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-bold text-red-600">Delete User?</h3>

              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{adminToDelete.restaurant}"</span>?
                <br />
                This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setAdminToDelete(null)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 bg-[#C5221F] hover:bg-[#A81B18] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="bg-[#F3F4ED] py-2.5 px-4 flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase text-gray-500 border-t border-gray-200/50">
              <Info className="w-3.5 h-3.5" />
              <span>THIS ACTION CAN'T BE UNDO</span>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <span className="font-bold text-xs text-gray-900">{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4 text-[#88C425]" />
        </div>
      )}
    </div>
  );
};