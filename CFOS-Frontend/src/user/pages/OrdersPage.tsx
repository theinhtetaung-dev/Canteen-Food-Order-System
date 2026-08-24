import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Package, LayoutGrid, List, X } from "lucide-react";
import { PageContainer } from "@user/components/layout/PageContainer";
import { OrderCard } from "@user/components/orders/OrderCard";
import { useOrders } from "@user/hooks/useOrders";
import { Button } from "@user/components/ui/button";
import { formatDateTime, formatPrice } from "@user/lib/utils";
import type { Order } from "@user/types/order";

export default function OrdersPage() {
  const { orders, cancelUserOrder } = useOrders();
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [viewStyle, setViewStyle] = useState<"card" | "table">("table");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleCancelOrder = (orderId: string) => {
    setCancelConfirmId(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!cancelConfirmId) return;
    try {
      await cancelUserOrder(cancelConfirmId);
      setDetailOrder(null);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setCancelConfirmId(null);
    }
  };

  useEffect(() => {
    const state = location.state as { newOrderId?: string } | null;
    if (state?.newOrderId) {
      setHighlightId(state.newOrderId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredOrders = orders.filter((order) => {
    if (!order.createdAt) return true;
    const orderDate = new Date(order.createdAt);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (orderDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (orderDate > end) return false;
    }
    return true;
  });

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
      </div>

      {highlightId && (
        <div className="mb-6 rounded-xl border border-brand/30 bg-brand-light/40 px-4 py-3 text-sm text-brand-dark">
          Order {highlightId} placed successfully! Status updates will appear
          here and in notifications.
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Filter by Date:</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Start:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">End:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-700"
                />
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex bg-white rounded-lg p-1 border border-gray-200 self-start sm:self-auto shrink-0">
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
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-brand-light" />
          <p className="text-gray-500">No orders yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Browse the menu and place your first order!
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-brand-light" />
          <p className="text-gray-500 font-semibold">No orders found</p>
          <p className="mt-1 text-sm text-gray-400 mb-4">
            No orders match the selected date range.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear Date Filter
          </Button>
        </div>
      ) : (
        viewStyle === "card" ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={
                  highlightId === order.id
                    ? "rounded-2xl ring-2 ring-brand ring-offset-2"
                    : undefined
                }
              >
                <OrderCard order={order} onDetailClick={() => setDetailOrder(order)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">No</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium">Total Price</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${highlightId === order.id ? 'bg-brand-light/20' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
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
            
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Order Code: <span className="font-normal text-gray-600">{detailOrder.id}</span></p>
              {(detailOrder.canteenName || detailOrder.canteenId) && (
                <p className="text-sm font-semibold text-gray-800 mt-1">Canteen: <span className="font-normal text-gray-600">{detailOrder.canteenName || `Canteen ${detailOrder.canteenId}`}</span></p>
              )}
            </div>

            <div className="mb-4 space-y-4 max-h-64 overflow-y-auto pr-2">
              {detailOrder.items.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3">
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                    {item.comment && (
                      <p className="text-xs text-brand italic mt-0.5">
                        Comment: {item.comment}
                      </p>
                    )}
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

      {/* Cancel Confirmation Modal */}
      {cancelConfirmId !== null && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setCancelConfirmId(null)}
            aria-label="Close cancel confirmation overlay"
          />
          <div className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 text-gray-900 font-extrabold pb-3 border-b border-gray-100">
              <X className="w-5 h-5 text-red-500" />
              <h2 className="text-lg">Cancel Order</h2>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelConfirmId(null)}
                className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                className="bg-[#C5221F] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#A81B18] transition-colors shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
