import { Minus, Plus } from "lucide-react";
import { useCart } from "@user/hooks/useCart";
import { cn, formatPrice } from "@user/lib/utils";
import type { MenuItem } from "@user/types/menu";

interface FoodCardProps {
  item: MenuItem;
  onAddToCart: (id: number) => void;
  onViewDetails: (item: MenuItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FoodCard({
  item,
  onAddToCart,
  onViewDetails,
  className,
  style,
}: FoodCardProps) {
  const { lines, addToCart, removeFromCart } = useCart();
  const cartLine = lines.find((line) => line.item.id === item.id);
  const quantity = cartLine ? cartLine.quantity : 0;

  return (
    <article
      style={style}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100 animate-fadeIn",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewDetails(item)}
        className="relative aspect-[16/9] w-full overflow-hidden bg-gray-50 text-left cursor-pointer"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onViewDetails(item)}
            className="text-left text-sm font-bold text-gray-900 transition-colors hover:text-brand line-clamp-1 flex-1 cursor-pointer"
          >
            {item.name}
          </button>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-gray-500 min-h-[2rem] leading-relaxed">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
          <p className="text-sm font-extrabold text-gray-900">
            {formatPrice(item.price)}
          </p>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 rounded-full bg-brand/5 border border-brand/10 p-0.5">
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-white text-brand border border-brand/10 shadow-sm transition-all hover:bg-brand hover:text-white active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center text-xs font-bold text-brand">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => addToCart(item.id)}
                className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-all hover:bg-brand-dark active:scale-90 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(item.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand hover:bg-brand-dark text-[11px] font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
