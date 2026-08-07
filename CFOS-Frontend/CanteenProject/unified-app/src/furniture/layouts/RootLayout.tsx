import { Outlet, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { CartDrawer } from "@furniture/components/layout/CartDrawer";
import { Footer } from "@furniture/components/layout/Footer";
import { Navbar } from "@furniture/components/layout/Navbar";
import { GlobalHeader } from "@furniture/components/layout/GlobalHeader";
import { useCart } from "@furniture/hooks/useCart";
import { useAuth } from "@furniture/hooks/useAuth";

export default function RootLayout() {
  const { totalItems, openCart } = useCart();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isHomePage = location.pathname === "/furniture" || location.pathname === "/furniture/";
  const isMenuPage = location.pathname.includes("/furniture/menu");

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Navbar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <GlobalHeader />
        <main className="flex-1 relative">
          <Outlet />
          
          {isMenuPage && (
            <button
              type="button"
              onClick={openCart}
              className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-110 hover:bg-brand-dark hover:shadow-xl active:scale-95"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </main>
        <Footer />
      </div>

      <CartDrawer />
    </div>
  );
}
