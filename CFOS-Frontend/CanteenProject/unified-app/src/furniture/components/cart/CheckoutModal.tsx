import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { useCart } from "@furniture/hooks/useCart";
import { useOrders } from "@furniture/hooks/useOrders";
import { formatPrice } from "@furniture/lib/utils";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lines, totalPrice, clearCart, closeCart } = useCart();
  const { placeNewOrder } = useOrders();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      onClose();
      closeCart();
      navigate("/login", { state: { from: "/menu" } });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const order = await placeNewOrder(
        lines.map((line) => ({ menuItem: line.item, quantity: line.quantity })),
        "As soon as possible",
      );
      clearCart();
      onClose();
      closeCart();
      navigate("/orders", { state: { newOrderId: order.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close checkout"
        className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Place Order</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Order Summary</h3>
          <ul className="space-y-3">
            {lines.map((line) => (
              <li key={line.item.id} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{line.item.name}</span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-500 shadow-sm">
                    x{line.quantity}
                  </span>
                </div>
                <span className="font-semibold text-gray-700">
                  {formatPrice(line.item.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-3">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-lg font-bold text-brand-dark">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {!isAuthenticated && (
          <p className="mb-4 text-sm text-gray-500">
            You need to log in before placing an order.
          </p>
        )}

        <button
          type="button"
          disabled={loading || lines.length === 0}
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark disabled:opacity-50"
        >
          {loading
            ? "Placing Order..."
            : isAuthenticated
              ? "Confirm Order"
              : "Log In to Order"}
        </button>
      </div>
    </>
  );
}
