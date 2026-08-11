import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ShoppingCart, UtensilsCrossed, X, ChevronDown } from "lucide-react";
import { FoodDetailModal } from "@furniture/components/menu/FoodDetailModal";
import { FoodGrid } from "@furniture/components/menu/FoodGrid";
import { useCart } from "@furniture/hooks/useCart";
import { useAuth } from "@furniture/hooks/useAuth";
import { api } from "@furniture/api/axios";
import { formatPrice } from "@furniture/lib/utils";
import type { MenuItem } from "@furniture/types/menu";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [appliedQuery, setAppliedQuery] = useState(searchParams.get("search") || "");
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, totalItems, totalPrice, openCart } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
              canteen: item.branchId || 1,
              category: item.categoryName || "Snacks",
              categoryId: item.categoryId,
              isAvailable: item.isAvailable !== false,
              description: item.description || "",
              createdByName: item.branchName || "General Shop",
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

  const shops = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((item) => {
      unique.add((item as any).createdByName || "General Shop");
    });
    return Array.from(unique);
  }, [items]);

  useEffect(() => {
    if (shops.length > 0 && !selectedShop) {
      setSelectedShop(shops[0]);
    }
  }, [shops, selectedShop]);

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

  useEffect(() => {
    setSelectedCategoryId("all");
    setCurrentPage(1);
  }, [selectedShop]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, appliedQuery]);

  const filteredItems = useMemo(() => {
    if (!selectedShop) return [];
    return items.filter((item) => {
      if (item.isAvailable === false) return false;
      const itemShop = (item as any).createdByName || "General Shop";
      if (itemShop !== selectedShop) return false;
      if (selectedCategoryId !== "all" && item.categoryId !== selectedCategoryId) return false;
      const query = appliedQuery.toLowerCase();
      return !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    });
  }, [items, selectedShop, selectedCategoryId, appliedQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, startIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b7a42]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-24">
      {/* Consolidated Filter & Search Bar */}
      <div className="bg-white border-b border-gray-200/80 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Canteen Switcher (Dropdown for multiple canteens) */}
          {shops.length > 0 && (
            <div className="relative shrink-0 w-full md:w-auto">
              <select
                value={selectedShop || ""}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full md:w-56 appearance-none bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-750 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] cursor-pointer shadow-sm transition-all hover:bg-gray-100"
              >
                {shops.map((shopName) => (
                  <option key={shopName} value={shopName}>
                    {shopName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* Search Bar with Search & Clear Buttons */}
          {selectedShop && (
            <div className="flex items-center gap-2 w-full md:max-w-md flex-1">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setAppliedQuery(searchQuery);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] text-xs font-semibold"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setAppliedQuery(searchQuery)}
                className="px-4 py-2.5 rounded-2xl bg-[#5b7a42] text-white text-xs font-bold shadow-sm hover:bg-[#4a6335] active:scale-95 transition-all cursor-pointer"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setAppliedQuery("");
                }}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-600 hover:text-gray-800 text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Category Switcher (Dropdown for multiple categories) */}
          {selectedShop && shopCategories.length > 0 && (
            <div className="relative shrink-0 w-full md:w-auto">
              <select
                value={selectedCategoryId === "all" ? "all" : selectedCategoryId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategoryId(val === "all" ? "all" : Number(val));
                }}
                className="w-full md:w-48 appearance-none bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-750 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] cursor-pointer shadow-sm transition-all hover:bg-gray-100"
              >
                <option value="all">All Categories</option>
                {shopCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-6 py-8">
        {selectedShop && (
          <>
            <FoodGrid items={paginatedItems} onAddToCart={addToCart} onViewDetails={setSelectedItem} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6 text-xs px-2">
                <span className="text-gray-500 font-medium">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} items</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === i + 1 ? "bg-[#5b7a42] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-45 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 animate-fadeIn">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Cart</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white animate-bounce">{totalItems}</span>
              <span className="text-sm font-extrabold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <button type="button" onClick={openCart} className="flex items-center gap-1.5 rounded-xl bg-[#5b7a42] hover:bg-[#4a6335] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-95">
            <ShoppingCart className="h-4 w-4" />
            <span>View Cart / Checkout</span>
          </button>
        </div>
      )}

      <FoodDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
    </div>
  );
}
