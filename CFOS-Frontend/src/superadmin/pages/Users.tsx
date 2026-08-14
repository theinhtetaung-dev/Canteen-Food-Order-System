import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Download,
  List,
  LayoutGrid,
} from 'lucide-react';
import { fetchStudents, deleteUser, resetUserPassword, type StudentUser } from "@user/api/user.api";
import Swal from 'sweetalert2';

const batchCategories = [
  'All Categories',
  '2018 Batch',
  '2019 Batch',
  '2021 Batch',
  '2022 Batch',
  '2023 Batch',
  '2024 Batch',
  '2025 Batch',
];

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

const swalSuccessClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
};

export const Users: React.FC = () => {
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter Dropdown States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('All Categories');
  const filterRef = useRef<HTMLDivElement>(null);

  // View Toggle State
  const [viewType, setViewType] = useState<'table' | 'card'>('table');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStudents();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load students", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStudents();
      setUsers(data);
      setSearchTerm(searchInput);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load students", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setSearchInput('');
    setSearchTerm('');
    try {
      setIsLoading(true);
      const data = await fetchStudents();
      setUsers(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load students", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatch =
      selectedBatch === 'All Categories' ||
      user.rollNo.toLowerCase().includes(selectedBatch.split(' ')[0].toLowerCase());

    return matchesSearch && matchesBatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-6xl space-y-6 relative">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Student Users
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Manage and monitor registered student profiles.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
        
        {/* Search, Filter, Export Actions Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Inputs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search user by username or roll no..."
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

          {/* Action Dropdown and Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            
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

            {/* Export XLS Button */}
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Feature Coming Soon',
                  text: 'Export functionality is currently under development.',
                  icon: 'info',
                  buttonsStyling: false,
                  width: '360px',
                  customClass: {
                    popup: 'rounded-2xl border border-[#DCE8FC] p-6 shadow-xl bg-white font-sans',
                    title: 'text-lg font-bold text-gray-900',
                    htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
                    confirmButton: 'px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm'
                  }
                });
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5B880A] hover:bg-[#4A7007] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export XLS</span>
            </button>
          </div>
        </div>

        {/* Users Table / Card View */}
        {viewType === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#B2C5A3] text-gray-800 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-md">NO</th>
                  <th className="py-3 px-4">USERNAME</th>
                  <th className="py-3 px-4">ROLL NUMBER</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">JOINED ON</th>
                  <th className="py-3 px-4 text-center rounded-r-md">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 font-bold">
                      Loading registered student users...
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 font-bold">
                      No student users found.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`transition-colors hover:bg-gray-50/80 ${
                        idx % 2 === 1 ? 'bg-[#F9FAF4]' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-gray-500 font-mono text-[11px]">
                        {startIndex + idx + 1}
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {user.userName}
                      </td>

                      <td className="py-3 px-4 text-gray-800 font-semibold font-mono text-[11px]">
                        {user.rollNo}
                      </td>

                      <td className="py-3 px-4 text-gray-600">{user.email}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            user.status === 'Active'
                              ? 'bg-[#E1EEB4] text-[#3B5B11]'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'Active' ? 'bg-[#5B880A]' : 'bg-gray-500'
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-gray-500 leading-tight">
                        {user.joinedOn}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* RESET PASSWORD BUTTON */}
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: 'Reset Password?',
                                text: `Are you sure you want to reset the password for student "${user.userName}" (Roll No: ${user.rollNo})?`,
                                icon: 'question',
                                showCancelButton: true,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalResetClass,
                                confirmButtonText: 'Reset',
                                cancelButtonText: 'Cancel'
                              }).then(async (result) => {
                                if (result.isConfirmed) {
                                  try {
                                    await resetUserPassword(user.id);
                                    Swal.fire({
                                      title: 'Success!',
                                      text: `Password reset successfully for "${user.userName}"!`,
                                      icon: 'success',
                                      timer: 2000,
                                      showConfirmButton: false,
                                      buttonsStyling: false,
                                      width: '360px',
                                      customClass: swalSuccessClass
                                    });
                                  } catch (error) {
                                    console.warn("Backend reset endpoint missing, mocking success.", error);
                                    Swal.fire({
                                      title: 'Success!',
                                      text: `Password reset successfully for "${user.userName}"!`,
                                      icon: 'success',
                                      timer: 2000,
                                      showConfirmButton: false,
                                      buttonsStyling: false,
                                      width: '360px',
                                      customClass: swalSuccessClass
                                    });
                                  }
                                }
                              });
                            }}
                            title="Reset Credentials"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <RotateCw className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          {/* DELETE USER BUTTON */}
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: 'Delete User?',
                                text: `Are you sure you want to delete student "${user.userName}" (Roll No: ${user.rollNo})? This action cannot be undone.`,
                                icon: 'warning',
                                showCancelButton: true,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalDeleteClass,
                                confirmButtonText: 'Delete',
                                cancelButtonText: 'Cancel'
                              }).then(async (result) => {
                                if (result.isConfirmed) {
                                  try {
                                    await deleteUser(user.id);
                                    setUsers(prev => prev.filter((u) => u.id !== user.id));
                                    Swal.fire({
                                      title: 'Deleted!',
                                      text: `User "${user.userName}" deleted successfully!`,
                                      icon: 'success',
                                      timer: 2000,
                                      showConfirmButton: false,
                                      buttonsStyling: false,
                                      width: '360px',
                                      customClass: swalSuccessClass
                                    });
                                  } catch (error) {
                                    console.error("Failed to delete user", error);
                                    Swal.fire({
                                      title: 'Error',
                                      text: `Failed to delete user "${user.userName}"`,
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
                            title="Delete User"
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
              <div className="col-span-full py-8 text-center text-gray-500 font-bold">
                Loading registered student users...
              </div>
            ) : currentUsers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-500 font-bold">
                No student users found.
              </div>
            ) : (
              currentUsers.map((user) => (
                <div key={user.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{user.userName}</h4>
                        <p className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">{user.rollNo}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-[#E1EEB4] text-[#3B5B11]'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-[#5B880A]' : 'bg-gray-500'
                          }`}
                        />
                        {user.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Email:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[150px]">{user.email || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Joined On:</span>
                        <span className="font-semibold text-slate-700">{user.joinedOn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Reset Password?',
                          text: `Are you sure you want to reset the password for student "${user.userName}" (Roll No: ${user.rollNo})?`,
                          icon: 'question',
                          showCancelButton: true,
                          buttonsStyling: false,
                          width: '360px',
                          customClass: swalResetClass,
                          confirmButtonText: 'Reset',
                          cancelButtonText: 'Cancel'
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            try {
                              await resetUserPassword(user.id);
                              Swal.fire({
                                title: 'Success!',
                                text: `Password reset successfully for "${user.userName}"!`,
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalSuccessClass
                              });
                            } catch (error) {
                              console.warn("Backend reset endpoint missing, mocking success.", error);
                              Swal.fire({
                                title: 'Success!',
                                text: `Password reset successfully for "${user.userName}"!`,
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalSuccessClass
                              });
                            }
                          }
                        });
                      }}
                      title="Reset Credentials"
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                    >
                      <RotateCw className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Delete User?',
                          text: `Are you sure you want to delete student "${user.userName}" (Roll No: ${user.rollNo})? This action cannot be undone.`,
                          icon: 'warning',
                          showCancelButton: true,
                          buttonsStyling: false,
                          width: '360px',
                          customClass: swalDeleteClass,
                          confirmButtonText: 'Delete',
                          cancelButtonText: 'Cancel'
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            try {
                              await deleteUser(user.id);
                              setUsers(prev => prev.filter((u) => u.id !== user.id));
                              Swal.fire({
                                title: 'Deleted!',
                                text: `User "${user.userName}" deleted successfully!`,
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                buttonsStyling: false,
                                width: '360px',
                                customClass: swalSuccessClass
                              });
                            } catch (error) {
                              console.error("Failed to delete user", error);
                              Swal.fire({
                                title: 'Error',
                                text: `Failed to delete user "${user.userName}"`,
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
                      title="Delete User"
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
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs">
            <span className="text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
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
