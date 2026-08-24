import type { CartLine } from "@user/types/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@user/lib/utils";

interface CartItemProps {
  line: CartLine;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateComment: (id: number, comment: string) => void;
}

export function CartItem({ line, onAdd, onRemove, onDelete, onUpdateComment }: CartItemProps) {
  const { item, quantity } = line;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-3">
        <img
          src={item.image}
          alt={item.name}
          className="h-20 w-20 shrink-0 rounded-xl object-cover border border-gray-50 shadow-sm"
        />
        <div className="flex flex-1 flex-col justify-between py-0.5">
          {/* Top Row: Item name and Delete button */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-sm text-gray-800 leading-snug line-clamp-2">
              {item.name}
            </h4>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Remove ${item.name} from cart`}
              className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Row: Price and Quantity Selector */}
          <div className="flex items-end justify-between mt-2 gap-2">
            <span className="text-sm font-extrabold text-brand">
              {formatPrice(item.price * quantity)}
            </span>
            
            <div className="flex items-center gap-2 rounded-full bg-brand/5 border border-brand/10 p-0.5 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Decrease ${item.name} quantity`}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand border border-brand/10 shadow-xs transition-all hover:bg-brand hover:text-white active:scale-90 cursor-pointer"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-5 text-center text-xs font-bold text-brand">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onAdd(item.id)}
                aria-label={`Increase ${item.name} quantity`}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-xs transition-all hover:bg-brand-dark active:scale-90 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <input
        type="text"
        placeholder="Add note (no onions, extra spicy...)"
        value={line.comment || ""}
        onChange={(e) => onUpdateComment(item.id, e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
      />
    </li>
  );
}
