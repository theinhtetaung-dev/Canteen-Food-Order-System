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
        </main>
        <Footer />
      </div>

      <CartDrawer />
    </div>
  );
}
