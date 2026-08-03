import type { ReactNode } from "react";
import { AuthProvider } from "@furniture/context/AuthContext";
import { CartProvider } from "@furniture/context/CartContext";
import { OrderProvider } from "@furniture/context/OrderContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>{children}</CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
