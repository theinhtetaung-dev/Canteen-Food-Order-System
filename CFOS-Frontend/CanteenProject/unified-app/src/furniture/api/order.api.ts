import { readStorage, writeStorage } from "@furniture/lib/storage";
import type { AppNotification, Order, OrderStatus, PlaceOrderPayload } from "@furniture/types/order";

const ORDERS_KEY = "canteen_orders";
const NOTIFICATIONS_KEY = "canteen_notifications";

function getOrders(): Order[] {
  return readStorage<Order[]>(ORDERS_KEY, []);
}

function saveOrders(orders: Order[]): void {
  writeStorage(ORDERS_KEY, orders);
}

function getNotifications(): AppNotification[] {
  return readStorage<AppNotification[]>(NOTIFICATIONS_KEY, []);
}

function saveNotifications(notifications: AppNotification[]): void {
  writeStorage(NOTIFICATIONS_KEY, notifications);
}

function createNotification(
  userId: string,
  orderId: string,
  title: string,
  message: string,
): AppNotification {
  return {
    id: crypto.randomUUID(),
    userId,
    orderId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  await delay(500);

  const order: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    userId: payload.userId,
    items: payload.items.map(({ menuItem, quantity }) => ({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      image: menuItem.image,
    })),
    totalPrice: payload.items.reduce(
      (sum, { menuItem, quantity }) => sum + menuItem.price * quantity,
      0,
    ),
    pickupTime: payload.pickupTime,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  const notifications = getNotifications();
  notifications.unshift(
    createNotification(
      payload.userId,
      order.id,
      "Order Placed",
      `Your order ${order.id} has been received. Pickup at ${payload.pickupTime}.`,
    ),
  );
  saveNotifications(notifications);

  scheduleStatusUpdates(order.id, payload.userId);
  return order;
}

function scheduleStatusUpdates(orderId: string, userId: string) {
  const updates: { delay: number; status: OrderStatus; title: string; message: string }[] = [
    {
      delay: 8000,
      status: "preparing",
      title: "Order Preparing",
      message: `Order ${orderId} is now being prepared.`,
    },
    {
      delay: 20000,
      status: "ready",
      title: "Order Ready!",
      message: `Order ${orderId} is ready for pickup.`,
    },
  ];

  updates.forEach(({ delay, status, title, message }) => {
    setTimeout(() => {
      updateOrderStatus(orderId, status, userId, title, message);
    }, delay);
  });
}

function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  userId: string,
  title: string,
  message: string,
) {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return;

  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  saveOrders(orders);

  const notifications = getNotifications();
  notifications.unshift(createNotification(userId, orderId, title, message));
  saveNotifications(notifications);

  window.dispatchEvent(new CustomEvent("canteen-orders-updated"));
}

export function fetchUserOrders(userId: string): Order[] {
  return getOrders().filter((o) => o.userId === userId);
}

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
