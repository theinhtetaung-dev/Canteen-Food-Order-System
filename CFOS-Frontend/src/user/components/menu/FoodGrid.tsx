import type { MenuItem } from "@user/types/menu";
import { FoodCard } from "@user/components/menu/FoodCard";

interface FoodGridProps {
  items: MenuItem[];
  onAddToCart: (id: number) => void;
  onViewDetails: (item: MenuItem) => void;
}

export function FoodGrid({ items, onAddToCart, onViewDetails }: FoodGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-gray-500">No items found. Try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
      {items.map((item, index) => (
        <FoodCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}
