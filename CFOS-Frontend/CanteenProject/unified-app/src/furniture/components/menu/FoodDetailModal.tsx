import { ShoppingCart, Star, X } from "lucide-react";
import { formatPrice } from "@furniture/lib/utils";
import type { MenuItem } from "@furniture/types/menu";

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (id: number) => void;
}

export function FoodDetailModal({
  item,
  onClose,
  onAddToCart,
}: FoodDetailModalProps) {
  if (!item) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-500 shadow hover:text-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={item.image}
          alt={item.name}
          className="h-56 w-full object-cover sm:h-64"
        />

        <div className="p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-4 w-4 fill-brand text-brand" />
              {item.rating}
            </div>
          </div>

          <p className="mb-4 text-sm capitalize text-brand-dark">
            Canteen {item.canteen} · {item.category}
          </p>

          <p className="mb-6 leading-relaxed text-gray-600">{item.description}</p>

          <div className="flex items-center justify-between gap-4">
            <p className="text-2xl font-bold text-gray-800">
              {formatPrice(item.price)}
            </p>
            <button
              type="button"
              onClick={() => {
                onAddToCart(item.id);
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-dark"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
