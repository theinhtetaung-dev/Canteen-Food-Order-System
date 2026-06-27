import { useState, useEffect, useCallback, useRef } from 'react';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Check, Image as ImageIcon, RefreshCw } from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { formatDisplayPrice, parsePrice } from '../../lib/utils';

interface Food {
  foodId: number;
  foodName: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  categoryId: number;
  categoryName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

const AUTO_REFRESH_MS = 30_000;

const Foods = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Delete confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    price: '',
    isAvailable: true,
    categoryId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const [foodsRes, catsRes] = await Promise.all([
        axiosPrivate.get('/foods'),
        axiosPrivate.get('/food-categories'),
      ]);
      setFoods(foodsRes.data);
      setCategories(catsRes.data);
    } catch {
      if (!silent) toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const handleOpenModal = (food?: Food) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        foodName: food.foodName,
        description: food.description,
        price: parsePrice(food.price).toString(),
        isAvailable: food.isAvailable,
        categoryId: food.categoryId.toString(),
      });
    } else {
      setEditingFood(null);
      setFormData({
        foodName: '',
        description: '',
        price: '',
        isAvailable: true,
        categoryId: categories.length > 0 ? categories[0].categoryId.toString() : '',
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFood(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    try {
      const data = new FormData();
      const foodReq = {
        foodName: formData.foodName,
        description: formData.description,
        price: parsePrice(formData.price),
        isAvailable: formData.isAvailable,
        categoryId: parseInt(formData.categoryId),
      };
      data.append('data', new Blob([JSON.stringify(foodReq)], { type: 'application/json' }));
      if (imageFile) data.append('image', imageFile);

      if (editingFood) {
        await axiosPrivate.put(`/foods/${editingFood.foodId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Food item updated');
      } else {
        await axiosPrivate.post('/foods', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Food item created');
      }
      handleCloseModal();
      fetchData();
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
      await axiosPrivate.delete(`/foods/${pendingDeleteId}`);
      toast.success('Food item deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const totalPages = Math.ceil(foods.length / pageSize) || 1;
  const displayedFoods = foods.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          {isRefreshing && (
            <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            className="btn btn-outline flex items-center gap-1"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Food Item
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedFoods.map((food) => (
                <tr key={food.foodId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                        {food.imageUrl ? (
                          <img className="h-10 w-10 object-cover" src={`http://localhost:8081${food.imageUrl}`} alt="" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-sm font-medium text-gray-900">{food.foodName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{food.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDisplayPrice(food.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${food.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {food.isAvailable ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal(food)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button onClick={() => handleDeleteClick(food.foodId)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {foods.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No food items found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            current_page={currentPage}
            total_pages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingFood ? 'Edit Food Item' : 'Add Food Item'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" required className="input-field" value={formData.foodName}
                  onChange={(e) => setFormData({ ...formData, foodName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select required className="input-field" value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <input type="number" step="0.01" min="0" required className="input-field" value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required rows={2} className="input-field" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex items-center">
                <input id="isAvailable" type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Currently Available</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input type="file" accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  onChange={(e) => { if (e.target.files && e.target.files.length > 0) setImageFile(e.target.files[0]); }} />
                {editingFood && editingFood.imageUrl && !imageFile && (
                  <p className="mt-1 text-xs text-gray-500">Current image will be kept if no new file is selected.</p>
                )}
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
        title="Delete Food Item"
        message="This action cannot be undone. The food item will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
};

export default Foods;
