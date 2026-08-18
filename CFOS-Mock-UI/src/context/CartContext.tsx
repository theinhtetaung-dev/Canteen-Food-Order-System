import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { parsePrice } from '../lib/utils';

export interface CartItem {
  foodId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    const cleanedItem = { ...newItem, price: parsePrice(newItem.price) };
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.foodId === cleanedItem.foodId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.foodId === cleanedItem.foodId
            ? { ...item, quantity: item.quantity + cleanedItem.quantity }
            : item
        );
      }
      return [...prevItems, cleanedItem];
    });
  };

  const removeFromCart = (foodId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.foodId !== foodId));
  };

  const updateQuantity = (foodId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.foodId === foodId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
