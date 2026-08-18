import type { OrderStatus } from "@user/types/order";
import { ORDER_STATUS_LABELS } from "@user/types/order";
import { cn } from "@user/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-brand-light text-brand-dark",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
