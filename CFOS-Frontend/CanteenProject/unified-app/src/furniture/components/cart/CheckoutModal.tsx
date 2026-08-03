import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, X } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { useCart } from "@furniture/hooks/useCart";
import { useOrders } from "@furniture/hooks/useOrders";
import { formatPrice } from "@furniture/lib/utils";
import { PICKUP_TIME_SLOTS } from "@furniture/types/order";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lines, totalPrice, clearCart, closeCart } = useCart();
  const { placeNewOrder } = useOrders();
  const [pickupTime, setPickupTime] = useState(PICKUP_TIME_SLOTS[1]);
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
        pickupTime,
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

        <div className="mb-4 rounded-xl bg-brand-light/40 p-4">
          <p className="text-sm text-gray-600">
            {lines.length} item(s) · Total{" "}
            <span className="font-bold text-gray-800">{formatPrice(totalPrice)}</span>
          </p>
        </div>

        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Clock className="h-4 w-4 text-brand" />
            Select Pickup Time
          </label>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full rounded-xl border border-brand/20 bg-brand-light/40 px-4 py-3 text-gray-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {PICKUP_TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
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
