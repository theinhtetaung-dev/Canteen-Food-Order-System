import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { CanteenTabs } from "@furniture/components/menu/CanteenTabs";
import { CategoryFilter } from "@furniture/components/menu/CategoryFilter";
import { FoodDetailModal } from "@furniture/components/menu/FoodDetailModal";
import { FoodGrid } from "@furniture/components/menu/FoodGrid";
import { useCart } from "@furniture/hooks/useCart";
import { fetchMenuItems } from "@furniture/api/menu.api";
import type { FoodCategory, MenuItem } from "@furniture/types/menu";

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const [activeCanteen, setActiveCanteen] = useState(1);
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "all">(
    "all",
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems()
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        console.error("Error loading menu items:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCanteen = item.canteen === activeCanteen;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      return matchesCanteen && matchesSearch && matchesCategory;
    });
  }, [items, activeCanteen, search, activeCategory]);

  return (
    <PageContainer>
      {search && (
        <p className="mb-4 text-sm text-gray-500">
          Results for &ldquo;{searchParams.get("search")}&rdquo;
        </p>
      )}

      <div className="mb-6 mt-6 space-y-5">
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
