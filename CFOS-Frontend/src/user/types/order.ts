import type { MenuItem } from "@user/types/menu";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  comment?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  pickupTime: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  canteenId?: number;
}

export interface PlaceOrderPayload {
  items: { menuItem: MenuItem; quantity: number; comment?: string }[];
  pickupTime: string;
  userId: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  orderId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Received",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PICKUP_TIME_SLOTS = [
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
];
