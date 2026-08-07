import { Eye, Plus } from "lucide-react";
import { cn, formatPrice } from "@furniture/lib/utils";
import type { MenuItem } from "@furniture/types/menu";

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
  return (
    <article
      style={style}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fadeIn",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewDetails(item)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 text-left"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(item)}
            className="text-left text-lg font-bold text-gray-900 transition-colors hover:text-brand"
          >
            {item.name}
          </button>
          <span className="shrink-0 rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
            ★ {item.rating}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(item.price)}
          </p>
          <button
            type="button"
            onClick={() => onAddToCart(item.id)}
            className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
