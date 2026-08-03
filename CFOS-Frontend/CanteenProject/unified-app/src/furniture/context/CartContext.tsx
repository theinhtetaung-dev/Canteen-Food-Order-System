import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { menuItems } from "@furniture/data/menuItems";
import type { CartAction, CartLine, CartState } from "@furniture/types/cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const quantity = (state.quantities[action.id] ?? 0) + 1;
      return {
        quantities: { ...state.quantities, [action.id]: quantity },
        isOpen: true,
      };
    }
    case "REMOVE": {
      const current = state.quantities[action.id] ?? 0;
      if (current <= 1) {
        const next = { ...state.quantities };
        delete next[action.id];
        return { ...state, quantities: next };
      }
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: current - 1 },
      };
    }
    case "DELETE": {
      const next = { ...state.quantities };
      delete next[action.id];
      return { ...state, quantities: next };
    }
    case "CLEAR":
      return { quantities: {}, isOpen: false };
    case "SET_OPEN":
      return { ...state, isOpen: action.open };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  totalItems: number;
  totalPrice: number;
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  deleteFromCart: (id: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const menuById = new Map(menuItems.map((item) => [item.id, item]));

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    quantities: {},
    isOpen: false,
  });

  const lines = useMemo<CartLine[]>(() => {
    return Object.entries(state.quantities)
      .map(([id, quantity]) => {
        const item = menuById.get(Number(id));
        return item ? { item, quantity } : null;
      })
      .filter((line): line is CartLine => line !== null);
  }, [state.quantities]);

  const totalItems = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const totalPrice = useMemo(
    () => lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0),
    [lines],
  );

  const addToCart = useCallback((id: number) => {
    dispatch({ type: "ADD", id });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const deleteFromCart = useCallback((id: number) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", open: true });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", open: false });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      deleteFromCart,
      clearCart,
      isOpen: state.isOpen,
      openCart,
      closeCart,
    }),
    [
      lines,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      deleteFromCart,
      clearCart,
      state.isOpen,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
