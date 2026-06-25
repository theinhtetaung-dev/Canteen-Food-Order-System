import { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  orderDetails: {
    foodId: number;
    foodName: string;
    quantity: number;
    priceAtTimeOfOrder: number;
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosPrivate.get('/orders?size=50&sortBy=createdAt&direction=desc');
      setOrders(response.data.content);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await axiosPrivate.patch(`/orders/${id}/status?status=${newStatus}`);
      toast.success(`Order #${id} status updated to ${newStatus}`);
      fetchOrders(); // Refresh list
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="block">
                <div 
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()} • {order.user?.username || 'Customer'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        value={order.status}
                        className={`text-xs font-semibold rounded-full border-0 py-1 pl-3 pr-8 focus:ring-0 ${getStatusColor(order.status)}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status} className="bg-white text-gray-900">{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {expandedOrder === order.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white">
                      {order.orderDetails.map((item, idx) => (
                        <li key={idx} className="px-4 py-2 flex justify-between text-sm">
                          <span className="text-gray-900">{item.quantity}x {item.foodName}</span>
                          <span className="text-gray-500">${(item.priceAtTimeOfOrder * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            {orders.length === 0 && (
              <li className="px-6 py-8 text-center text-gray-500">
                No orders found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orders;
