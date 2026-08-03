import { useState } from "react";
import { Eye } from "lucide-react";
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
        "group flex flex-col overflow-hidden rounded-2xl border border-gray-100",
        "bg-white shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg animate-fadeIn",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewDetails(item)}
        className="relative aspect-[4/3] overflow-hidden bg-brand-light/40 text-left"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand-dark backdrop-blur-sm">
          <Eye className="h-3.5 w-3.5" />
          View Details
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(item)}
            className="text-left text-base font-semibold text-gray-800 hover:text-brand sm:text-lg"
          >
            {item.name}
          </button>
          <span className="shrink-0 text-sm text-gray-500">★ {item.rating}</span>
        </div>

        <p className="line-clamp-2 text-sm text-gray-500">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-gray-800">
            {formatPrice(item.price)}
          </p>
          <button
            type="button"
            onClick={() => onAddToCart(item.id)}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark active:scale-95"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
