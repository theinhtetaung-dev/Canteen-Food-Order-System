import React, { useState, useEffect } from 'react';
import { fetchBranches, type Branch, createBranch, updateBranch, deleteBranch } from "@furniture/api/branch.api";
import Swal from 'sweetalert2';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
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
      <div className="max-w-4xl space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span>Canteens</span>
          <span>/</span>
          <span className="text-gray-700">
            {viewMode === 'create' ? 'Create New Canteen' : 'Edit Canteen'}
          </span>
        </div>

        {/* Back Link & Header Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setViewMode('list'); setEditingBranch(null); }}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {viewMode === 'create' ? 'Create New Canteen' : 'Edit Canteen'}
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900">Canteen Details</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Provide the name and location/address for the canteen.
            </p>
          </div>

          <form onSubmit={viewMode === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-4 max-w-2xl">
            {/* Canteen Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Canteen Name
              </label>
              <input
                type="text"
                placeholder="Enter canteen name (e.g. Main Canteen, North Gate Canteen)"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Location / Address
              </label>
              <input
                type="text"
                placeholder="Enter canteen location or building name"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#88C425] hover:bg-[#77AF1D] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
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
        <p className="text-sm font-medium text-gray-500 mt-1">
          Manage and configure canteens and layouts.
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

          <button
            onClick={startCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Canteen
          </button>
        </div>

        {/* Table List */}
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

        {/* Pagination Logic */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs">
            <span className="text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBranches.length)} of {filteredBranches.length} canteens
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
    </div>
  );
};
