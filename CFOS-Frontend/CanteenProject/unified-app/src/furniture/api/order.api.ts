import { api } from "@furniture/api/axios";
import { readStorage, writeStorage } from "@furniture/lib/storage";
import type { AppNotification, Order, PlaceOrderPayload } from "@furniture/types/order";

const NOTIFICATIONS_KEY = "canteen_notifications";

function getNotifications(): AppNotification[] {
  return readStorage<AppNotification[]>(NOTIFICATIONS_KEY, []);
}

function saveNotifications(notifications: AppNotification[]): void {
  writeStorage(NOTIFICATIONS_KEY, notifications);
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  const items = payload.items.map(({ menuItem, quantity }) => ({
    menuItemId: menuItem.id,
    quantity,
  }));

  const { data } = await api.post<Order>("/api/orders", {
    userId: payload.userId,
    items,
    pickupTime: payload.pickupTime,
  });

  return data;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  // We can pass userId as a query parameter if needed, but assuming the endpoint fetches based on current auth/or all
  const { data } = await api.get<Order[]>(`/api/orders`);
  return data.filter(o => o.userId === userId);
}

// Keeping notifications local for now as there's no backend endpoint for notifications yet
export function fetchUserNotifications(userId: string): AppNotification[] {
  return getNotifications().filter((n) => n.userId === userId);
}

export function markNotificationRead(notificationId: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index === -1) return;
  notifications[index].read = true;
  saveNotifications(notifications);
  window.dispatchEvent(new CustomEvent("canteen-orders-updated"));
}

export function markAllNotificationsRead(userId: string): void {
  const notifications = getNotifications().map((n) =>
    n.userId === userId ? { ...n, read: true } : n,
  );
  saveNotifications(notifications);
  window.dispatchEvent(new CustomEvent("canteen-orders-updated"));
}
