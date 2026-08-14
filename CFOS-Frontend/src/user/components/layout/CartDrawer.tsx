import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import { CartItem } from "@user/components/cart/CartItem";
import { CartSummary } from "@user/components/cart/CartSummary";
import { CheckoutModal } from "@user/components/cart/CheckoutModal";
import { useCart } from "@user/hooks/useCart";
import { useMediaQuery } from "@user/hooks/useMediaQuery";
import { cn } from "@user/lib/utils";

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
    clearCart,
  } = useCart();
  const location = useLocation();
  const isMenuPage = location.pathname.includes("/user/menu");
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      {isOpen && isMobile && isMenuPage && (
        <button
          type="button"
          aria-label="Close cart overlay"
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-white shadow-2xl transition-all duration-300",
          isMobile
            ? "fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-3xl border-t border-gray-100"
            : "sticky top-0 z-40 h-screen shrink-0 border-l border-gray-100",
          isMobile
            ? (isOpen && isMenuPage)
              ? "translate-y-0"
              : "translate-y-full"
            : (isMenuPage && (totalItems > 0 || isOpen))
              ? "w-80 lg:w-[400px] opacity-100 translate-x-0"
              : "w-0 overflow-hidden border-none opacity-0 translate-x-full",
        )}
      >
        <div className={cn("flex flex-col h-full", !isMobile && "w-80 lg:w-[400px]")}>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
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
              className={cn("rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700", (!isMobile && totalItems > 0) && "hidden")}
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
            <div className="shrink-0">
              <CartSummary
                totalPrice={totalPrice}
                onCheckout={() => setCheckoutOpen(true)}
                onCancel={clearCart}
              />
            </div>
          )}
        </div>
      </aside>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
