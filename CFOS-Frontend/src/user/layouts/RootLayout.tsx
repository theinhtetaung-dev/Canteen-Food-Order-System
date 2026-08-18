import { Outlet, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { CartDrawer } from "@user/components/layout/CartDrawer";
import { Footer } from "@user/components/layout/Footer";
import { Navbar } from "@user/components/layout/Navbar";
import { GlobalHeader } from "@user/components/layout/GlobalHeader";
import { useCart } from "@user/hooks/useCart";
import { useAuth } from "@user/hooks/useAuth";

export default function RootLayout() {
  const { totalItems, openCart } = useCart();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isHomePage = location.pathname === "/user" || location.pathname === "/user/";
  const isMenuPage = location.pathname.includes("/user/menu");

  return (
    <div className="flex min-h-screen bg-bg-main relative">
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
