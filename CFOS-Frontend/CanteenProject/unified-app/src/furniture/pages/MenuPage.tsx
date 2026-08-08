import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { FoodDetailModal } from "@furniture/components/menu/FoodDetailModal";
import { FoodGrid } from "@furniture/components/menu/FoodGrid";
import { useCart } from "@furniture/hooks/useCart";
import { api } from "@furniture/api/axios";
import type { MenuItem } from "@furniture/types/menu";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8081";
    api.get<any[]>("/api/foods")
      .then(({ data }) => {
        const availableItems = data
          .filter((item: any) => item.isAvailable !== false)
          .map((item: any) => {
            return {
              id: item.foodId,
              name: item.foodName,
              price: Number(item.price),
              rating: 4.8,
              image: item.imageUrl ? (item.imageUrl.startsWith("http") ? item.imageUrl : `${baseUrl}${item.imageUrl}`) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
              canteen: (item.foodId % 2 === 0) ? 2 : 1,
              category: item.categoryName || "Snacks",
              categoryId: item.categoryId,
              isAvailable: item.isAvailable !== false,
              description: item.description || "",
              createdByName: item.createdByName || "General Shop",
            } as any;
          });
        setItems(availableItems);
      })
      .catch((err) => {
        console.error("Error loading menu items:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Get unique shops (full names from db)
  const shops = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((item) => {
      unique.add((item as any).createdByName || "General Shop");
    });
    return Array.from(unique);
  }, [items]);

  // Default select the first shop when items are loaded
  useEffect(() => {
    if (shops.length > 0 && !selectedShop) {
      setSelectedShop(shops[0]);
    }
  }, [shops, selectedShop]);

  // Get categories belonging ONLY to the selected shop
  const shopCategories = useMemo(() => {
    if (!selectedShop) return [];
    const shopItems = items.filter(
      (item) => ((item as any).createdByName || "General Shop") === selectedShop
    );
    const categoriesMap = new Map<number, string>();
    shopItems.forEach((item) => {
      if (item.categoryId) {
        categoriesMap.set(item.categoryId, (item as any).category || "Snacks");
      }
    });
    return Array.from(categoriesMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [items, selectedShop]);

  // Reset category filter when changing shops
  useEffect(() => {
    setSelectedCategoryId("all");
  }, [selectedShop]);

  // Filter items based on shop, category, and search query
  const filteredItems = useMemo(() => {
    if (!selectedShop) return [];
    return items.filter((item) => {
      if (item.isAvailable === false) return false;

      // Shop check
      const itemShop = (item as any).createdByName || "General Shop";
      if (itemShop !== selectedShop) return false;

      // Category check
      if (
        selectedCategoryId !== "all" &&
        item.categoryId !== selectedCategoryId
      ) {
        return false;
      }

      // Search check
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [items, selectedShop, selectedCategoryId, searchQuery]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        {/* Centered Order Now Title with Underline */}
        <div className="text-center space-y-2 mt-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight relative inline-block pb-2">
            Order Now
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#5b7a42] rounded-full"></span>
          </h1>
        </div>

        {/* Shop selector pills (Full name from database) */}
        {shops.length > 0 && (
          <div className="flex justify-center gap-3.5 mt-4">
            {shops.map((shopName) => {
              const isSelected = selectedShop === shopName;
              return (
                <button
                  key={shopName}
                  type="button"
                  onClick={() => setSelectedShop(shopName)}
                  className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-200 ${
                    isSelected
                      ? "bg-[#a8bb92] text-[#344424] border border-[#96a980] shadow-sm scale-105"
                      : "bg-[#cbd9bd]/60 text-[#4d5e3c] hover:bg-[#b2c49c]/70"
                  }`}
                >
                  {shopName}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Category Filter belonging only to the selected shop */}
        {selectedShop && shopCategories.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mt-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === "all"
                  ? "bg-[#5b7a42] text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            {shopCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryId === cat.id
                    ? "bg-[#5b7a42] text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Search Input for filtering shop items */}
        {selectedShop && (
          <div className="flex justify-center pt-2">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs font-semibold"
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        {selectedShop && (
          <FoodGrid
            items={filteredItems}
            onAddToCart={addToCart}
            onViewDetails={setSelectedItem}
          />
        )}
      </div>

      {/* Detail Modal */}
      <FoodDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
    </PageContainer>
  );
}
