export type CartAction =
  | { type: "ADD"; id: number }
  | { type: "REMOVE"; id: number }
  | { type: "DELETE"; id: number }
  | { type: "SET_OPEN"; open: boolean }
  | { type: "CLEAR" };

export interface CartLine {
  item: import("@user/types/menu").MenuItem;
  quantity: number;
}

export interface CartState {
  quantities: Record<number, number>;
  isOpen: boolean;
}
