import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Heading } from '../components/ui/Heading';
import { Card, CardContent } from '../components/ui/Card';
import { ShoppingBag } from 'lucide-react';

interface OrderItem {
  orderItemId: number;
  foodName: string;
  quantity: number;
  subTotal: number;
}

interface Order {
  orderId: number;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data.content || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div>
        <Heading level={2} className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          Order History
        </Heading>
        <p className="text-sm text-slate-500 mt-1">
          View your past orders and their status.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            You have no past orders.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Order #{order.orderId}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">${order.totalAmount.toFixed(2)}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                    order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
              <CardContent className="p-0">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.orderItems?.map((item, idx) => (
                    <li key={idx} className="p-4 flex justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{item.quantity}x</span>
                        <span className="text-sm">{item.foodName}</span>
                      </div>
                      <span className="text-sm text-slate-500">${item.subTotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
