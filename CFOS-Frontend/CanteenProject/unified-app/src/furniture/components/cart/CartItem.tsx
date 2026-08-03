import type { CartLine } from "@furniture/types/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@furniture/lib/utils";

interface CartItemProps {
  line: CartLine;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onDelete: (id: number) => void;
}

export function CartItem({ line, onAdd, onRemove, onDelete }: CartItemProps) {
  const { item, quantity } = line;

  return (
    <li className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <img
        src={item.image}
        alt={item.name}
        className="h-16 w-16 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-gray-800">{item.name}</p>
          <div className="flex items-center gap-2">
            <p className="shrink-0 text-sm font-semibold text-gray-800">
              {formatPrice(item.price * quantity)}
            </p>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Remove ${item.name} from cart`}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Decrease ${item.name} quantity`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-brand-dark transition-colors hover:bg-brand/20"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-6 text-center text-sm font-medium text-gray-700">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onAdd(item.id)}
            aria-label={`Increase ${item.name} quantity`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-brand-dark transition-colors hover:bg-brand/20"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
