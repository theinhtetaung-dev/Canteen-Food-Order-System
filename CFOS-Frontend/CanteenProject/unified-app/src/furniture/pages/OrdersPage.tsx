import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Package, LayoutGrid, List, X } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { OrderCard } from "@furniture/components/orders/OrderCard";
import { useOrders } from "@furniture/hooks/useOrders";
import { Button } from "@furniture/components/ui/button";
import { formatDateTime, formatPrice } from "@furniture/lib/utils";
import type { Order } from "@furniture/types/order";

export default function OrdersPage() {
  const { orders, cancelUserOrder } = useOrders();
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [viewStyle, setViewStyle] = useState<"card" | "table">("table");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelUserOrder(orderId);
      setDetailOrder(null);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  useEffect(() => {
    const state = location.state as { newOrderId?: string } | null;
    if (state?.newOrderId) {
      setHighlightId(state.newOrderId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-sm text-gray-500">
            Track your order status and view order history.
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewStyle("table")}
            className={viewStyle === "table" ? "bg-brand/10 text-brand" : "text-gray-500"}
          >
            <List className="h-4 w-4 mr-2" /> Table
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewStyle("card")}
            className={viewStyle === "card" ? "bg-brand/10 text-brand" : "text-gray-500"}
          >
            <LayoutGrid className="h-4 w-4 mr-2" /> Card
          </Button>
        </div>
      </div>

      {highlightId && (
        <div className="mb-6 rounded-xl border border-brand/30 bg-brand-light/40 px-4 py-3 text-sm text-brand-dark">
          Order {highlightId} placed successfully! Status updates will appear
          here and in notifications.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-brand-light" />
          <p className="text-gray-500">No orders yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Browse the menu and place your first order!
          </p>
        </div>
      ) : (
        viewStyle === "card" ? (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className={
                  highlightId === order.id
                    ? "rounded-2xl ring-2 ring-brand ring-offset-2"
                    : undefined
                }
              >
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">No</th>
                  <th scope="col" className="px-6 py-4 font-medium">Order ID</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium">Total Price</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order, index) => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${highlightId === order.id ? 'bg-brand-light/20' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4">{formatDateTime(order.createdAt)}</td>
                    <td className="px-6 py-4 font-semibold text-brand-dark">{formatPrice(order.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-brand hover:text-brand-dark" onClick={() => setDetailOrder(order)}>
                          Detail
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 text-xs font-bold px-2.5 py-1 h-auto rounded-lg"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {detailOrder && (
        <>
          <button
            type="button"
            aria-label="Close modal"
            className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setDetailOrder(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
              <button type="button" onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4 space-y-4 max-h-64 overflow-y-auto pr-2">
              {detailOrder.items.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-600">Total Price</span>
              <span className="text-lg font-bold text-brand-dark">{formatPrice(detailOrder.totalPrice)}</span>
            </div>

            {detailOrder.status === 'pending' && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Button
                  onClick={() => handleCancelOrder(detailOrder.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel Order
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </PageContainer>
  );
}
