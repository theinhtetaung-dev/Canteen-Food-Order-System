import { readStorage, writeStorage } from "@furniture/lib/storage";
import { api } from "@furniture/api/axios";
import type { AppNotification, Order, OrderStatus, PlaceOrderPayload } from "@furniture/types/order";

const NOTIFICATIONS_KEY = "canteen_notifications";

function getNotifications(): AppNotification[] {
  return readStorage<AppNotification[]>(NOTIFICATIONS_KEY, []);
}

function saveNotifications(notifications: AppNotification[]): void {
  writeStorage(NOTIFICATIONS_KEY, notifications);
}

function mapBackendStatus(status: string): OrderStatus {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETE" || s === "COMPLETED") return "completed";
  if (s === "CANCEL" || s === "CANCELLED") return "cancelled";
  if (s === "PREPARING") return "preparing";
  return "pending";
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  const { data } = await api.post<any>("/api/orders", {
    orderItems: payload.items.map((item) => ({
      foodId: item.menuItem.id,
      quantity: item.quantity,
    })),
  });

  const order: Order = {
    id: `ORD-${data.orderId}`,
    userId: data.userName,
    items: data.orderItems.map((item: any) => ({
      menuItemId: item.orderItemId,
      name: item.foodName,
      price: Number(item.snapPrice),
      quantity: item.quantity,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
    })),
    totalPrice: Number(data.totalAmount),
    pickupTime: payload.pickupTime,
    status: mapBackendStatus(data.orderStatus),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };

  const notifications = getNotifications();
  notifications.unshift({
    id: crypto.randomUUID(),
    userId: payload.userId,
    orderId: order.id,
    title: "Order Placed",
    message: `Your order ${order.id} has been received. Pickup at ${payload.pickupTime}.`,
    read: false,
    createdAt: new Date().toISOString(),
  });
  saveNotifications(notifications);

  return order;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data } = await api.get<{ content: any[] }>("/api/orders", {
      params: { size: 100 }
    });

    const userOrders = data.content.filter((order) => order.userName === userId);

    return userOrders.map((order) => ({
      id: `ORD-${order.orderId}`,
      userId: order.userName,
      items: order.orderItems.map((item: any) => ({
        menuItemId: item.orderItemId,
        name: item.foodName,
        price: Number(item.snapPrice),
        quantity: item.quantity,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
      })),
      totalPrice: Number(order.totalAmount),
      pickupTime: "12:00 PM",
      status: mapBackendStatus(order.orderStatus),
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.updatedAt || new Date().toISOString(),
      canteenId: order.canteenId,
    }));
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
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

export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const { data } = await api.get<{ content: any[] }>("/api/orders", {
      params: { size: 1000 }
    });

    return data.content.map((order) => ({
      id: `ORD-${order.orderId}`,
      userId: order.userName,
      items: order.orderItems.map((item: any) => ({
        menuItemId: item.orderItemId,
        name: item.foodName,
        price: Number(item.snapPrice),
        quantity: item.quantity,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
      })),
      totalPrice: Number(order.totalAmount),
      pickupTime: "12:00 PM",
      status: mapBackendStatus(order.orderStatus),
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.updatedAt || new Date().toISOString(),
      canteenId: order.canteenId,
    }));
  } catch (err) {
    console.error("Error fetching all orders:", err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string | number, status: string): Promise<void> {
  const numericId = typeof orderId === 'string' ? orderId.replace('ORD-', '') : orderId;
  const upperStatus = status.toUpperCase() === "COMPLETED" || status.toUpperCase() === "COMPLETE" ? "COMPLETE" : status.toUpperCase();
  await api.patch(`/api/orders/${numericId}/status?status=${upperStatus}`);
}
