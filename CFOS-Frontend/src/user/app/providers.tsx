import type { ReactNode } from "react";
import { AuthProvider } from "@user/context/AuthContext";
import { CartProvider } from "@user/context/CartContext";
import { OrderProvider } from "@user/context/OrderContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>{children}</CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}
