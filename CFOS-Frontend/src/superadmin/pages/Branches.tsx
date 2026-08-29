import React, { useState, useEffect } from 'react';
import { fetchBranches, type Branch, createBranch, updateBranch, deleteBranch } from "@user/api/branch.api";
import { fetchAllUsers } from "@user/api/user.api";
import Swal from 'sweetalert2';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  List,
  LayoutGrid,
} from 'lucide-react';

const swalCustomClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
  confirmButton: 'px-5 py-2.5 bg-[#C5221F] hover:bg-[#A81B18] text-white text-xs font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 mx-1.5',
  cancelButton: 'px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500/20 mx-1.5',
  actions: 'flex items-center justify-center gap-2 mt-4',
};

const swalSuccessClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
};

export const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Page Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // View Toggle State
  const [viewType, setViewType] = useState<'table' | 'card'>('table');

  // Form State
  const [formData, setFormData] = useState({
    branchName: '',
    location: '',
  });

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBranches();
      setBranches(data);
    } catch (err) {
      console.error("Failed to fetch canteens", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBranches();
      setBranches(data);
      setSearchTerm(searchInput);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch canteens", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setSearchInput('');
    setSearchTerm('');
    try {
      setIsLoading(true);
      const data = await fetchBranches();
      setBranches(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch canteens", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branches.filter((branch) =>
    branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.location && branch.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBranches = filteredBranches.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchName) return;

    try {
      const saved = await createBranch({
        branchName: formData.branchName,
        location: formData.location
      });

      setBranches([saved, ...branches]);
      setViewMode('list');

      setFormData({
        branchName: '',
        location: '',
      });

      Swal.fire({
        title: 'Success!',
        text: 'New Canteen created successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        buttonsStyling: false,
        width: '360px',
        customClass: swalSuccessClass
      });
    } catch (err) {
      console.error("Failed to create canteen", err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to create canteen',
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !formData.branchName) return;

    try {
      const updated = await updateBranch(editingBranch.branchId, {
        branchName: formData.branchName,
        location: formData.location
      });

      setBranches(branches.map(b => b.branchId === editingBranch.branchId ? updated : b));
      setViewMode('list');
      setEditingBranch(null);

      setFormData({
        branchName: '',
        location: '',
      });

      Swal.fire({
        title: 'Success!',
        text: 'Canteen updated successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        buttonsStyling: false,
        width: '360px',
        customClass: swalSuccessClass
      });
    } catch (err) {
      console.error("Failed to update canteen", err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update canteen',
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

  const startEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      branchName: branch.branchName,
      location: branch.location || '',
    });
    setViewMode('edit');
  };

  const startCreate = () => {
    setFormData({
      branchName: '',
      location: '',
    });
    setViewMode('create');
  };

  // ---------------- VIEW 1: CREATE OR EDIT CANTEEN FORM ----------------
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Canteens</span>
          <span>/</span>
          <span className="text-slate-700">
            {viewMode === 'create' ? 'Create New Canteen' : 'Edit Canteen'}
          </span>
        </div>

        {/* Back Link & Header Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setViewMode('list'); setEditingBranch(null); }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {viewMode === 'create' ? 'Create New Canteen' : 'Edit Canteen'}
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900">Canteen Details</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Provide the name and location/address for the canteen.
            </p>
          </div>

          <form onSubmit={viewMode === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Canteen Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Canteen Name
                </label>
                <input
                  type="text"
                  placeholder="Enter canteen name (e.g. Main Canteen, North Gate Canteen)"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all text-sm bg-white"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Location / Address
                </label>
                <input
                  type="text"
                  placeholder="Enter canteen location or building name"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all text-sm bg-white"
                />
              </div>
            </div>

            {/* Footer: Action buttons right-aligned on desktop, full-width on mobile */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setViewMode('list'); setEditingBranch(null); }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7ca038] hover:bg-[#6b8b2e] text-white font-semibold text-sm shadow-sm transition-all"
              >
                {viewMode === 'create' ? 'Create Canteen' : 'Update Canteen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- VIEW 2: CANTEENS LIST TABLE ----------------
  return (
    <div className="max-w-6xl space-y-6 relative">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Canteens
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
                placeholder="Search canteen by name or location"
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
              onClick={startCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Canteen
            </button>
          </div>
        </div>

        {/* Table List / Card View */}
        {viewType === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#B2C5A3] text-gray-800 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-md">NO</th>
                  <th className="py-3 px-4">CANTEEN NAME</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4 text-center rounded-r-md">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400 font-bold">
                      Loading canteens...
                    </td>
                  </tr>
                ) : currentBranches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400 font-bold">
                      No canteens found.
                    </td>
                  </tr>
                ) : (
                  currentBranches.map((branch, idx) => (
                    <tr
                      key={branch.branchId}
                      className={`transition-colors hover:bg-gray-50/80 ${
                        idx % 2 === 1 ? 'bg-[#F9FAF4]' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-gray-500 font-mono text-[11px]">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {branch.branchName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {branch.location || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => startEdit(branch)}
                            title="Edit Canteen"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: 'Delete Canteen?',
                                text: `Are you sure you want to delete the canteen "${branch.branchName}"? This action cannot be undone.`,
                                icon: 'warning',
                                showCancelButton: true,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalCustomClass,
                                confirmButtonText: 'Delete',
                                cancelButtonText: 'Cancel'
                              }).then(async (result) => {
                                if (result.isConfirmed) {
                                  try {
                                    const allUsers = await fetchAllUsers();
                                    const hasConnectedUser = allUsers.some(u => u.canteenId === branch.branchId);
                                    if (hasConnectedUser) {
                                      Swal.fire({
                                        title: 'Cannot Delete Canteen',
                                        text: `There are users/admins assigned to "${branch.branchName}". Please reassign or delete them first.`,
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
                                    await deleteBranch(branch.branchId);
                                    setBranches(prev => prev.filter((b) => b.branchId !== branch.branchId));
                                    Swal.fire({
                                      title: 'Deleted!',
                                      text: 'Canteen deleted successfully!',
                                      icon: 'success',
                                      timer: 2000,
                                      showConfirmButton: false,
                                      buttonsStyling: false,
                                      width: '360px',
                                      customClass: swalSuccessClass
                                    });
                                  } catch (err) {
                                    console.error("Failed to delete canteen", err);
                                    Swal.fire({
                                      title: 'Error',
                                      text: 'Failed to delete canteen',
                                      icon: 'error',
                                      buttonsStyling: false,
                                      width: '360px',
                                      customClass: {
                                        ...swalSuccessClass,
                                        confirmButton: 'px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl'
                                      }
                                    });
                                  }
                                }
                              });
                            }}
                            title="Delete Canteen"
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
                Loading canteens...
              </div>
            ) : currentBranches.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-400 font-bold">
                No canteens found.
              </div>
            ) : (
              currentBranches.map((branch) => (
                <div key={branch.branchId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{branch.branchName}</h4>
                    
                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Location:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[180px]" title={branch.location || 'N/A'}>
                          {branch.location || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => startEdit(branch)}
                      title="Edit Canteen"
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                    >
                      <Edit className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Delete Canteen?',
                          text: `Are you sure you want to delete the canteen "${branch.branchName}"? This action cannot be undone.`,
                          icon: 'warning',
                          showCancelButton: true,
                          buttonsStyling: false,
                          width: '360px',
                          customClass: swalCustomClass,
                          confirmButtonText: 'Delete',
                          cancelButtonText: 'Cancel'
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            try {
                              const allUsers = await fetchAllUsers();
                              const hasConnectedUser = allUsers.some(u => u.canteenId === branch.branchId);
                              if (hasConnectedUser) {
                                Swal.fire({
                                  title: 'Cannot Delete Canteen',
                                  text: `There are users/admins assigned to "${branch.branchName}". Please reassign or delete them first.`,
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
                              await deleteBranch(branch.branchId);
                              setBranches(prev => prev.filter((b) => b.branchId !== branch.branchId));
                              Swal.fire({
                                title: 'Deleted!',
                                text: 'Canteen deleted successfully!',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalSuccessClass
                              });
                            } catch (err) {
                              console.error("Failed to delete canteen", err);
                              Swal.fire({
                                title: 'Error',
                                text: 'Failed to delete canteen',
                                icon: 'error',
                                buttonsStyling: false,
                                width: '360px',
                                customClass: {
                                  ...swalSuccessClass,
                                  confirmButton: 'px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl'
                                }
                              });
                            }
                          }
                        });
                      }}
                      title="Delete Canteen"
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

        {/* Pagination Logic */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs">
            <span className="text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBranches.length)} of {filteredBranches.length} canteens
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
    </div>
  );
};
