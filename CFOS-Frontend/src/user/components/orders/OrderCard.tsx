import { Package } from "lucide-react";
import { OrderStatusBadge } from "@user/components/orders/OrderStatusBadge";
import { formatPrice, formatDateTime } from "@user/lib/utils";
import type { Order } from "@user/types/order";
import { Button } from "@user/components/ui/button";

interface OrderCardProps {
  order: Order;
  onDetailClick?: () => void;
}

export function OrderCard({ order, onDetailClick }: OrderCardProps) {
  const date = formatDateTime(order.createdAt);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{order.id}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 text-sm">
        <Button
          size="sm"
          variant="outline"
          className="text-brand hover:text-brand-dark"
          onClick={onDetailClick}
        >
          Detail
        </Button>
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <Package className="h-4 w-4 text-brand" />
          {formatPrice(order.totalPrice)}
        </div>
      </div>
    </article>
  );
}
