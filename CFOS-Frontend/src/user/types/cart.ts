export type CartAction =
  | { type: "ADD"; id: number }
  | { type: "REMOVE"; id: number }
  | { type: "DELETE"; id: number }
  | { type: "SET_OPEN"; open: boolean }
  | { type: "UPDATE_COMMENT"; id: number; comment: string }
  | { type: "CLEAR" };

export interface CartLine {
  item: import("@user/types/menu").MenuItem;
  quantity: number;
  comment?: string;
}

export interface CartState {
  quantities: Record<number, number>;
  comments?: Record<number, string>;
  isOpen: boolean;
}
