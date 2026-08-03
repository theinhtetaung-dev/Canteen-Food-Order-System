import { formatPrice } from "@furniture/lib/utils";

interface CartSummaryProps {
  totalPrice: number;
  onCheckout?: () => void;
}

export function CartSummary({ totalPrice, onCheckout }: CartSummaryProps) {
  return (
    <div className="border-t border-gray-100 bg-brand-light/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-lg font-bold text-gray-800">
          {formatPrice(totalPrice)}
        </span>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
      >
        Place Order
      </button>
    </div>
  );
}
