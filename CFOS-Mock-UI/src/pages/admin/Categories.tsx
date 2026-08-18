import { useState, useEffect, useCallback, useRef } from 'react';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Check, RefreshCw } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';

interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
}

const AUTO_REFRESH_MS = 30_000;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({ categoryName: '', description: '' });

  // Delete confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCategories = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const response = await axiosPrivate.get('/food-categories');
      setCategories(response.data);
    } catch {
      if (!silent) toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    fetchCategories();
    intervalRef.current = setInterval(() => fetchCategories(true), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCategories]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ categoryName: category.categoryName, description: category.description });
    } else {
      setEditingCategory(null);
      setFormData({ categoryName: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axiosPrivate.put(`/food-categories/${editingCategory.categoryId}`, formData);
        toast.success('Category updated successfully');
      } else {
        await axiosPrivate.post('/food-categories', formData);
        toast.success('Category created successfully');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Open confirm dialog instead of window.confirm
  const handleDeleteClick = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (pendingDeleteId === null) return;
    setConfirmOpen(false);
    try {
      await axiosPrivate.delete(`/food-categories/${pendingDeleteId}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const totalPages = Math.ceil(categories.length / pageSize) || 1;
  const displayedCategories = categories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Food Categories</h2>
          {isRefreshing && <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchCategories(true)} className="btn btn-outline flex items-center gap-1" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {displayedCategories.map((category) => (
              <li key={category.categoryId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{category.categoryName}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(category.categoryId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-6 py-8 text-center text-gray-500">
                No categories found. Create one to get started.
              </li>
            )}
          </ul>
          <Pagination
            current_page={currentPage}
            total_pages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" required className="input-field" value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required rows={3} className="input-field" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary flex items-center">
                  <Check className="h-4 w-4 mr-2" />Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Category"
        message="This action cannot be undone. All food items in this category may be affected."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
};

export default Categories;
