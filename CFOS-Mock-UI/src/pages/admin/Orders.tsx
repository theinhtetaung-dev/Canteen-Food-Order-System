import { useState, useEffect, useCallback, useRef } from 'react';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Check, Trash2, RefreshCw, ShoppingBag } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import { formatDisplayPrice, parsePrice } from '../../lib/utils';

interface OrderItem {
  orderItemId: number;
  foodName: string;
  quantity: number;
  snapPrice: number;
  subTotal: number;
}

interface Order {
  orderId: number;
  userName: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface Food {
  foodId: number;
  foodName: string;
  price: number;
  isAvailable: boolean;
}

interface NewOrderItem {
  foodId: number;
  foodName: string;
  price: number;
  quantity: number;
}

const AUTO_REFRESH_MS = 15_000;

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [newOrderItems, setNewOrderItems] = useState<NewOrderItem[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const response = await axiosPrivate.get(`/orders?page=${currentPage - 1}&size=${pageSize}&sortBy=createdAt&direction=desc`);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage]);

  const fetchFoods = async () => {
    try {
      const response = await axiosPrivate.get('/foods');
      // Only show available foods for creating a new order
      setFoods((response.data || []).filter((f: Food) => f.isAvailable));
    } catch {
      toast.error('Failed to load foods for ordering');
    }
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(() => fetchOrders(true), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await axiosPrivate.patch(`/orders/${orderId}/status?status=${newStatus}`);
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders(true);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleOpenCreateModal = () => {
    fetchFoods();
    setNewOrderItems([]);
    setSelectedFoodId('');
    setSelectedQuantity(1);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleAddFoodToOrder = () => {
    if (!selectedFoodId) {
      toast.error('Please select a food item');
      return;
    }
    const food = foods.find(f => f.foodId === parseInt(selectedFoodId));
    if (!food) return;

    // Check if food already in new order items
    const existingIndex = newOrderItems.findIndex(item => item.foodId === food.foodId);
    if (existingIndex > -1) {
      const updated = [...newOrderItems];
      updated[existingIndex].quantity += selectedQuantity;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems([
        ...newOrderItems,
        {
          foodId: food.foodId,
          foodName: food.foodName,
          price: parsePrice(food.price),
          quantity: selectedQuantity,
        }
      ]);
    }
    toast.success(`Added ${selectedQuantity}x ${food.foodName}`);
    // Reset selection inputs
    setSelectedFoodId('');
    setSelectedQuantity(1);
  };

  const handleRemoveNewOrderItem = (index: number) => {
    setNewOrderItems(newOrderItems.filter((_, i) => i !== index));
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const payload = {
        orderItems: newOrderItems.map(item => ({
          foodId: item.foodId,
          quantity: item.quantity
        }))
      };

      await axiosPrivate.post('/orders', payload);
      toast.success('Order created successfully!');
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':    return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETE':   return 'bg-green-100 text-green-800';
      case 'CANCEL':     return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['PENDING', 'COMPLETE', 'CANCEL'];
  const newOrderTotal = newOrderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          {isRefreshing && <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">Auto-refreshes every 15 s</span>
          <button
            onClick={() => fetchOrders(true)}
            className="btn btn-outline flex items-center gap-1"
            title="Refresh now"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
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
            {orders.map((order) => (
              <li key={order.orderId} className="block">
                <div
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900">Order #{order.orderId}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()} • {order.userName || 'Customer'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm font-bold text-gray-900">${formatDisplayPrice(order.totalAmount)}</p>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                        value={order.orderStatus}
                        className={`text-xs font-semibold rounded-full border-0 py-1 pl-3 pr-8 focus:ring-0 cursor-pointer ${getStatusColor(order.orderStatus)}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status} className="bg-white text-gray-900">{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {expandedOrder === order.orderId && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white">
                      {(order.orderItems ?? []).map((item, idx) => (
                        <li key={idx} className="px-4 py-2 flex justify-between text-sm">
                          <span className="text-gray-900">
                            {item.quantity}x {item.foodName} <span className="text-xs text-gray-400">(${formatDisplayPrice(item.snapPrice)} each)</span>
                          </span>
                          <span className="text-gray-700 font-medium">${formatDisplayPrice(item.subTotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            {orders.length === 0 && (
              <li className="px-6 py-8 text-center text-gray-500">No orders found.</li>
            )}
          </ul>
          <Pagination
            current_page={currentPage}
            total_pages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
                Create New Order
              </h3>
              <button onClick={handleCloseCreateModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Item Builder Form */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Item</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      className="input-field"
                      value={selectedFoodId}
                      onChange={(e) => setSelectedFoodId(e.target.value)}
                    >
                      <option value="">Select food item</option>
                      {foods.map(food => (
                        <option key={food.foodId} value={food.foodId}>
                          {food.foodName} (${formatDisplayPrice(food.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="Qty"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddFoodToOrder}
                  className="w-full btn btn-outline btn-sm flex items-center justify-center py-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add to Order
                </button>
              </div>

              {/* Current Order Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Summary</h4>
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto divide-y divide-gray-200">
                  {newOrderItems.map((item, index) => (
                    <div key={index} className="px-4 py-2 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold text-gray-900">{item.quantity}x</span> {item.foodName}
                        <span className="text-xs text-gray-500 ml-2">(${formatDisplayPrice(item.price)} each)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">${formatDisplayPrice(item.price * item.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewOrderItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {newOrderItems.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No items added yet. Add items above.
                    </div>
                  )}
                </div>
              </div>

              {/* Total and Submit */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">${formatDisplayPrice(newOrderTotal)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOrderSubmit}
                    disabled={isSubmittingOrder || newOrderItems.length === 0}
                    className="btn btn-primary flex items-center"
                  >
                    {isSubmittingOrder ? 'Placing Order...' : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
