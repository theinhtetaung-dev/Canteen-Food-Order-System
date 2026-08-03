import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { CanteenTabs } from "@furniture/components/menu/CanteenTabs";
import { CategoryFilter } from "@furniture/components/menu/CategoryFilter";
import { FoodDetailModal } from "@furniture/components/menu/FoodDetailModal";
import { FoodGrid } from "@furniture/components/menu/FoodGrid";
import { useCart } from "@furniture/hooks/useCart";
import { menuItems } from "@furniture/data/menuItems";
import type { FoodCategory, MenuItem } from "@furniture/types/menu";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const [activeCanteen, setActiveCanteen] = useState(1);
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "all">(
    "all",
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCanteen = item.canteen === activeCanteen;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      return matchesCanteen && matchesSearch && matchesCategory;
    });
  }, [activeCanteen, search, activeCategory]);

  return (
    <PageContainer>
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">
          <span className="text-brand">Order</span>{" "}
          <span className="text-gray-800">Now</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse menu, view details, and add items to your cart
        </p>
      </div>

      {search && (
        <p className="mb-4 text-center text-sm text-gray-500">
          Results for &ldquo;{searchParams.get("search")}&rdquo;
        </p>
      )}

      <div className="mb-6 mt-8 space-y-5">
        <CanteenTabs
          activeCanteen={activeCanteen}
          onChange={(canteen) => {
            setActiveCanteen(canteen);
            setActiveCategory("all");
          }}
        />
        <CategoryFilter
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      <FoodGrid
        items={filteredItems}
        onAddToCart={addToCart}
        onViewDetails={setSelectedItem}
      />

      <FoodDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
    </PageContainer>
  );
}
