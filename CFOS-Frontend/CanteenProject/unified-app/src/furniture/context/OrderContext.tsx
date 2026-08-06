import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchUserNotifications,
  fetchUserOrders,
  markAllNotificationsRead,
  markNotificationRead,
  placeOrder,
} from "@furniture/api/order.api";
import { useAuth } from "@furniture/context/AuthContext";
import type { AppNotification, Order } from "@furniture/types/order";
import type { MenuItem } from "@furniture/types/menu";

interface OrderContextValue {
  orders: Order[];
  notifications: AppNotification[];
  unreadCount: number;
  placeNewOrder: (items: { menuItem: MenuItem; quantity: number }[], pickupTime: string) => Promise<Order>;
  refresh: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    if (!user) {
      setOrders([]);
      setNotifications([]);
      return;
    }
    fetchUserOrders(user.id)
      .then((userOrders) => {
        setOrders(userOrders);
      })
      .catch((err) => {
        console.error("Failed to load user orders:", err);
      });
    setNotifications(fetchUserNotifications(user.id));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("canteen-orders-updated", handler);
    return () => window.removeEventListener("canteen-orders-updated", handler);
  }, [refresh]);

  const placeNewOrder = useCallback(
    async (items: { menuItem: MenuItem; quantity: number }[], pickupTime: string) => {
      if (!user) throw new Error("Please log in to place an order.");
      const order = await placeOrder({ items, pickupTime, userId: user.id });
      refresh();
      return order;
    },
    [user, refresh],
  );

  const markRead = useCallback(
    (id: string) => {
      markNotificationRead(id);
      refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(() => {
    if (!user) return;
    markAllNotificationsRead(user.id);
    refresh();
  }, [user, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<OrderContextValue>(
    () => ({
      orders,
      notifications,
      unreadCount,
      placeNewOrder,
      refresh,
      markRead,
      markAllRead,
    }),
    [orders, notifications, unreadCount, placeNewOrder, refresh, markRead, markAllRead],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
