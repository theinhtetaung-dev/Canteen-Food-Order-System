import { Clock, Package } from "lucide-react";
import { OrderStatusBadge } from "@furniture/components/orders/OrderStatusBadge";
import { formatPrice } from "@furniture/lib/utils";
import type { Order } from "@furniture/types/order";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt).toLocaleString();

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{order.id}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mb-4 space-y-2">
        {order.items.map((item) => (
          <div key={item.menuItemId} className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-gray-500">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4 text-brand" />
          Pickup: {order.pickupTime}
        </div>
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <Package className="h-4 w-4 text-brand" />
          {formatPrice(order.totalPrice)}
        </div>
      </div>
    </article>
  );
}
