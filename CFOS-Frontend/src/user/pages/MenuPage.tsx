import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ShoppingCart, UtensilsCrossed, X, ChevronDown } from "lucide-react";
import { FoodDetailModal } from "@user/components/menu/FoodDetailModal";
import { FoodGrid } from "@user/components/menu/FoodGrid";
import { useCart } from "@user/hooks/useCart";
import { useAuth } from "@user/hooks/useAuth";
import { api } from "@user/api/axios";
import { fetchBranches, type Branch } from "@user/api/branch.api";
import { formatPrice } from "@user/lib/utils";
import type { MenuItem } from "@user/types/menu";

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [appliedQuery, setAppliedQuery] = useState(searchParams.get("search") || "");
  const [canteens, setCanteens] = useState<Branch[]>([]);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
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
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8081";
    // Fetch canteens from tbl_canteen
    fetchBranches()
      .then((branches) => {
        setCanteens(branches);
        if (branches.length > 0) {
          setSelectedShop(branches[0].branchId);
        }
      })
      .catch((err) => console.error("Error loading canteens:", err));
    // Fetch food items
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



  const shopCategories = useMemo(() => {
    if (!selectedShop) return [];
    const shopItems = items.filter(
      (item) => (item as any).canteen === selectedShop
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
      if ((item as any).canteen !== selectedShop) return false;
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
    <div className="min-h-screen bg-bg-main flex flex-col relative pb-24">
      {/* Consolidated Filter & Search Bar */}
      <div className="bg-white border-b border-gray-200/80 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Canteen Switcher (Dropdown - populated from tbl_canteen) */}
          {canteens.length > 0 && (
            <div className="relative shrink-0 w-full md:w-auto">
              <select
                value={selectedShop ?? ""}
                onChange={(e) => setSelectedShop(Number(e.target.value))}
                className="w-full md:w-56 appearance-none bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-750 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] cursor-pointer shadow-sm transition-all hover:bg-gray-100"
              >
                {canteens.map((c) => (
                  <option key={c.branchId} value={c.branchId}>
                    {c.branchName}
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
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-150 rounded-full shadow-sm text-slate-550 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="flex items-center gap-1 bg-white border border-slate-150 rounded-full shadow-sm px-2.5 py-1">
                    {(() => {
                      const getPaginationRange = (current: number, total: number) => {
                        const range: (number | string)[] = [];
                        if (total <= 7) {
                          for (let i = 1; i <= total; i++) range.push(i);
                          return range;
                        }
                        range.push(1);
                        const start = Math.max(2, current - 1);
                        const end = Math.min(total - 1, current + 1);
                        if (start > 2) {
                          range.push("...");
                        }
                        for (let i = start; i <= end; i++) {
                          range.push(i);
                        }
                        if (end < total - 1) {
                          range.push("...");
                        }
                        range.push(total);
                        return range;
                      };

                      return getPaginationRange(currentPage, totalPages).map((page, idx) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`dots-${idx}`}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-xs select-none"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => setCurrentPage(Number(page))}
                            className={`w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                              currentPage === page
                                ? "bg-[#284208] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50 hover:text-[#284208]"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-150 rounded-full shadow-sm text-slate-550 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>


      <FoodDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
    </div>
  );
}
