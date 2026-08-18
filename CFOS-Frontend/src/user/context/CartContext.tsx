import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { fetchMenuItems } from "@user/api/menu.api";
import type { CartAction, CartLine, CartState } from "@user/types/cart";
import type { MenuItem } from "@user/types/menu";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const quantity = (state.quantities[action.id] ?? 0) + 1;
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: quantity },
        isOpen: true,
      };
    }
    case "REMOVE": {
      const current = state.quantities[action.id] ?? 0;
      if (current <= 1) {
        const nextQuantities = { ...state.quantities };
        delete nextQuantities[action.id];
        const nextComments = { ...state.comments };
        delete nextComments[action.id];
        return { ...state, quantities: nextQuantities, comments: nextComments };
      }
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: current - 1 },
      };
    }
    case "DELETE": {
      const nextQuantities = { ...state.quantities };
      delete nextQuantities[action.id];
      const nextComments = { ...state.comments };
      delete nextComments[action.id];
      return { ...state, quantities: nextQuantities, comments: nextComments };
    }
    case "UPDATE_COMMENT": {
      return {
        ...state,
        comments: { ...state.comments, [action.id]: action.comment },
      };
    }
    case "CLEAR":
      return { quantities: {}, comments: {}, isOpen: false };
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
  updateComment: (id: number, comment: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    quantities: {},
    comments: {},
    isOpen: false,
  });

  const [menuItemsList, setMenuItemsList] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchMenuItems()
      .then((data) => {
        setMenuItemsList(data);
      })
      .catch((err) => {
        console.error("CartProvider: Error loading menu items:", err);
      });
  }, [state.isOpen]); // Refresh menu item lookup when cart is opened or on initial load

  const menuById = useMemo(() => {
    return new Map(menuItemsList.map((item) => [item.id, item]));
  }, [menuItemsList]);

  const lines = useMemo<CartLine[]>(() => {
    return Object.entries(state.quantities)
      .map(([id, quantity]) => {
        const item = menuById.get(Number(id));
        const comment = state.comments?.[Number(id)] || "";
        return item ? { item, quantity, comment } : null;
      })
      .filter((line): line is CartLine => line !== null);
  }, [state.quantities, state.comments, menuById]);

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

  const updateComment = useCallback((id: number, comment: string) => {
    dispatch({ type: "UPDATE_COMMENT", id, comment });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      deleteFromCart,
      updateComment,
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
      updateComment,
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
