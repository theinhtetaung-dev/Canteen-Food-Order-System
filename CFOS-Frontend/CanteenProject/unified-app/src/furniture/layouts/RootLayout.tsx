import { Outlet } from "react-router-dom";
import { CartDrawer } from "@furniture/components/layout/CartDrawer";
import { Footer } from "@furniture/components/layout/Footer";
import { Navbar } from "@furniture/components/layout/Navbar";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-main">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
