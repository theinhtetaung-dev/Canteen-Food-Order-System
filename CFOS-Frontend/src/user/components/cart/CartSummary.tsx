import { formatPrice } from "@user/lib/utils";

interface CartSummaryProps {
  totalPrice: number;
  onCheckout?: () => void;
  onCancel?: () => void;
}

export function CartSummary({ totalPrice, onCheckout, onCancel }: CartSummaryProps) {
  return (
    <div className="border-t border-gray-100 bg-brand-light/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-lg font-bold text-gray-800">
          {formatPrice(totalPrice)}
        </span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onCheckout}
          className="flex-[2] rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
