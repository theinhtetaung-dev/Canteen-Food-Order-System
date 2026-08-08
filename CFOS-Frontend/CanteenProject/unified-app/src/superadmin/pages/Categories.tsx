import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category
} from '../../furniture/api/category.api';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form inputs state
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setCategoryToEdit(null);
    setCategoryName('');
    setDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setCategoryToEdit(cat);
    setCategoryName(cat.categoryName);
    setDescription(cat.description || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      if (categoryToEdit) {
        // Edit flow
        const updated = await updateCategory(categoryToEdit.categoryId, {
          categoryName,
          description
        });
        setCategories(categories.map(c => c.categoryId === categoryToEdit.categoryId ? updated : c));
        triggerToast(`Category "${categoryName}" updated successfully!`);
      } else {
        // Create flow
        const created = await createCategory({
          categoryName,
          description
        });
        setCategories([...categories, created]);
        triggerToast(`Category "${categoryName}" created successfully!`);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save category", error);
      triggerToast("Failed to save category. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.categoryId);
        setCategories(categories.filter(c => c.categoryId !== categoryToDelete.categoryId));
        triggerToast(`Category "${categoryToDelete.categoryName}" deleted successfully!`);
      } catch (error) {
        console.error("Failed to delete category", error);
        triggerToast(`Failed to delete category "${categoryToDelete.categoryName}"`);
      } finally {
        setCategoryToDelete(null);
      }
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(c =>
    c.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CATEGORIES_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE);
  const visibleCategories = filteredCategories.length >= 10
    ? filteredCategories.slice((currentPage - 1) * CATEGORIES_PER_PAGE, currentPage * CATEGORIES_PER_PAGE)
    : filteredCategories;

  return (
    <div className="max-w-6xl space-y-6 relative font-sans">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Categories</h2>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Manage food categories for restaurant menus.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#284208] text-white hover:bg-[#1c2e0a] text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
        {/* Search bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#88C425] transition-all"
          />
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10 text-sm font-semibold text-gray-400">
              Loading categories...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EAEFE4] text-gray-700 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-md w-16">NO</th>
                  <th className="py-3 px-4">CATEGORY NAME</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4">CREATED BY</th>
                  <th className="py-3 px-4 text-center rounded-r-md w-32">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {visibleCategories.map((cat, idx) => {
                  const globalIndex = filteredCategories.length >= 10
                    ? (currentPage - 1) * CATEGORIES_PER_PAGE + idx + 1
                    : idx + 1;
                  return (
                    <tr
                      key={cat.categoryId}
                      className={`transition-colors hover:bg-gray-50/80 ${
                        idx % 2 === 1 ? 'bg-[#FAFBF8]' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-gray-500 font-mono text-[11px]">
                        {globalIndex}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-gray-900">
                        {cat.categoryName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {cat.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-semibold">
                        {cat.createdByName || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            title="Edit Category"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Pencil className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            title="Delete Category"
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-gray-400 font-bold">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredCategories.length >= 10 && (
          <div className="p-4 border-t border-gray-100 bg-[#FAFBF8] flex items-center justify-between text-xs text-gray-500 rounded-b-2xl">
            <div>
              Showing {((currentPage - 1) * CATEGORIES_PER_PAGE) + 1}-{Math.min(currentPage * CATEGORIES_PER_PAGE, filteredCategories.length)} of {filteredCategories.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 hover:text-gray-900 disabled:opacity-30 transition-opacity font-bold"
              >
                ‹ Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    currentPage === page
                      ? "bg-[#284208] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 hover:text-gray-900 disabled:opacity-30 transition-opacity font-bold"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                {categoryToEdit ? "Edit Category" : "Create Category"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Snack, Dessert, Beverage"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#88C425]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#88C425] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#284208] hover:bg-[#1c2e0a] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  {categoryToEdit ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-red-600">Delete Category?</h3>
              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                Are you sure you want to delete <br />
                <span className="font-bold text-gray-900">"{categoryToDelete.categoryName}"</span>?
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setCategoryToDelete(null)}
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
              <span>THIS ACTION CAN'T BE UNDONE</span>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <span className="font-bold text-xs text-gray-900">{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4 text-[#88C425]" />
        </div>
      )}
    </div>
  );
};

export default Categories;
