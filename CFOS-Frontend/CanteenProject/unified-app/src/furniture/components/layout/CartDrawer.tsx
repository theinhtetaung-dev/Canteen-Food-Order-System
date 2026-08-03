import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CartItem } from "@furniture/components/cart/CartItem";
import { CartSummary } from "@furniture/components/cart/CartSummary";
import { CheckoutModal } from "@furniture/components/cart/CheckoutModal";
import { useCart } from "@furniture/hooks/useCart";
import { useMediaQuery } from "@furniture/hooks/useMediaQuery";
import { cn } from "@furniture/lib/utils";

export function CartDrawer() {
  const {
    lines,
    totalItems,
    totalPrice,
    removeFromCart,
    addToCart,
    deleteFromCart,
    isOpen,
    closeCart,
  } = useCart();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close cart overlay"
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300",
          isMobile
            ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl border-t border-gray-100"
            : "right-0 top-0 h-full w-full max-w-md border-l border-gray-100",
          isOpen
            ? "translate-x-0 translate-y-0"
            : isMobile
              ? "translate-y-full"
              : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-gray-800">
              Your Cart ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="h-12 w-12 text-brand-light" />
              <p className="text-gray-500">Your cart is empty</p>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <CartItem
                  key={line.item.id}
                  line={line}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onDelete={deleteFromCart}
                />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <CartSummary
            totalPrice={totalPrice}
            onCheckout={() => setCheckoutOpen(true)}
          />
        )}
      </aside>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
