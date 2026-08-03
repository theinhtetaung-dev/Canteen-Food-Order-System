import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Package } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { OrderCard } from "@furniture/components/orders/OrderCard";
import { useOrders } from "@furniture/hooks/useOrders";

export default function OrdersPage() {
  const { orders } = useOrders();
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { newOrderId?: string } | null;
    if (state?.newOrderId) {
      setHighlightId(state.newOrderId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <PageContainer>
      <h1 className="mb-2 text-3xl font-bold text-gray-800">My Orders</h1>
      <p className="mb-8 text-sm text-gray-500">
        Track your order status and view order history.
      </p>

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
      )}
    </PageContainer>
  );
}
