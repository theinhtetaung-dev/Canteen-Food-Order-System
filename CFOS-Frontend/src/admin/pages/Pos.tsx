import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ShoppingCart, ChevronDown, Plus, Minus, CheckCircle } from "lucide-react";
import { FoodDetailModal } from "../../user/components/menu/FoodDetailModal";
import { FoodGrid } from "../../user/components/menu/FoodGrid";
import { useCart } from "../../user/hooks/useCart";
import { api } from "../../user/api/axios";
import { fetchBranches, type Branch } from "../../user/api/branch.api";
import { formatPrice } from "../../user/lib/utils";
import type { MenuItem } from "../../user/types/menu";



export default function Pos() {
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

  // POS Cart State
  const { lines, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8081";

  useEffect(() => {
    let userCanteenId: number | null = null;
    
    // First get the user's assigned canteen
    api.get("/api/users/me")
      .then((res) => {
        userCanteenId = res.data.canteenId;
      })
      .catch((err) => console.error("Failed to fetch user profile:", err))
      .finally(() => {
        fetchBranches()
          .then((branches) => {
            // Filter to only their canteen if assigned
            const availableBranches = userCanteenId 
              ? branches.filter(b => b.branchId === userCanteenId)
              : branches;
            
            setCanteens(availableBranches);
            if (availableBranches.length > 0) {
              setSelectedShop(availableBranches[0].branchId);
            }
          })
          .catch((err) => console.error("Error loading canteens:", err));
      });
      
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
      .catch((err) => console.error("Error loading menu items:", err))
      .finally(() => setIsLoading(false));
  }, [baseUrl]);

  const shopCategories = useMemo(() => {
    if (!selectedShop) return [];
    const shopItems = items.filter((item) => (item as any).canteen === selectedShop);
    const categoriesMap = new Map<number, string>();
    shopItems.forEach((item) => {
      if (item.categoryId) categoriesMap.set(item.categoryId, (item as any).category || "Snacks");
    });
    return Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));
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
  const paginatedItems = useMemo(() => filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE), [filteredItems, startIndex]);

  const placeOrder = async () => {
    setIsCheckingOut(true);
    try {
      const payload = {
        orderItems: lines.map(c => ({ foodId: c.item.id, quantity: c.quantity }))
      };
      await api.post("/api/orders", payload);
      clearCart();
      setSuccessMessage("Walk-in order created successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place walk-in order.");
    } finally {
      setIsCheckingOut(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5b7a42]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6 bg-gray-50 font-sans overflow-hidden">
      {/* Left Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto relative pb-12">
        <div className="bg-white border-b border-gray-200/80 py-4 shadow-sm px-6 sticky top-0 z-10">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#1c2e0a]">Walk-in POS</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {canteens.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={selectedShop ?? ""}
                    onChange={(e) => setSelectedShop(Number(e.target.value))}
                    className="w-48 appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2 text-xs font-bold text-gray-750 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] cursor-pointer"
                  >
                    {canteens.map((c) => (
                      <option key={c.branchId} value={c.branchId}>{c.branchName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {selectedShop && shopCategories.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={selectedCategoryId === "all" ? "all" : selectedCategoryId}
                    onChange={(e) => { const val = e.target.value; setSelectedCategoryId(val === "all" ? "all" : Number(val)); }}
                    className="w-40 appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2 text-xs font-bold text-gray-750 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {shopCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {selectedShop && (
              <div className="flex items-center gap-2 max-w-sm w-full">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") setAppliedQuery(searchQuery); }}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5b7a42]/20 focus:border-[#5b7a42] text-xs font-semibold"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button onClick={() => setAppliedQuery(searchQuery)} className="px-3 py-2 rounded-xl bg-[#5b7a42] text-white text-xs font-bold hover:bg-[#4a6335]">Search</button>
                <button onClick={() => { setSearchQuery(""); setAppliedQuery(""); }} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold">Clear</button>
              </div>
            )}
          </div>
        </div>

        <main className="flex-grow w-full px-6 py-8">
          {selectedShop && (
            <>
              <FoodGrid items={paginatedItems} onAddToCart={(id) => {
                addToCart(id);
                setSuccessMessage("Added to cart.");
                setTimeout(() => setSuccessMessage(""), 3000);
              }} onViewDetails={setSelectedItem} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6 text-xs px-2">
                  <span className="text-gray-500 font-medium">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} items</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-xl text-xs font-bold ${currentPage === i + 1 ? "bg-[#5b7a42] text-white" : "text-gray-600 hover:bg-gray-100"}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Right Side Cart Sidebar */}
      {lines.length > 0 && (
      <div className="w-[380px] bg-white border-l border-gray-200 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] flex flex-col shrink-0 z-20">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-white shrink-0">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#5b7a42]" />
            Walk-in Order
          </h2>
          <span className="bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold px-2.5 py-1 rounded-lg">
            {totalItems} items
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {lines.map((line) => (
            <div key={line.item.id} className="flex gap-4 items-start border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
              <img src={line.item.image} alt={line.item.name} className="h-16 w-16 rounded-xl object-cover shadow-sm border border-gray-100" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{line.item.name}</h3>
                <p className="text-sm font-black text-[#5b7a42] mt-1">{formatPrice(line.item.price * line.quantity)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <button onClick={() => removeFromCart(line.item.id)} className="p-1.5 text-gray-500 hover:bg-gray-100"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-xs font-bold text-gray-700">{line.quantity}</span>
                    <button onClick={() => addToCart(line.item.id)} className="p-1.5 text-gray-500 hover:bg-gray-100"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => deleteFromCart(line.item.id)} className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg">Remove</button>
                </div>
              </div>
            </div>
          ))}
          {lines.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-gray-400">Select items from the menu to start</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-white p-5 space-y-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-base font-black text-gray-900">
            <span>Total Amount</span>
            <span className="text-[#5b7a42] text-xl">{formatPrice(totalPrice)}</span>
          </div>
          
          <div className="flex gap-3">
            <button
              disabled={lines.length === 0 || isCheckingOut}
              onClick={clearCart}
              className="w-1/3 rounded-xl bg-red-50 text-red-600 py-3.5 text-sm font-bold shadow-sm hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={lines.length === 0 || isCheckingOut}
              onClick={placeOrder}
              className="flex-1 rounded-xl bg-[#5b7a42] text-white py-3.5 text-sm font-bold shadow-md hover:bg-[#4a6335] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      <FoodDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={(id) => { 
        addToCart(id); 
        setSelectedItem(null);
        setSuccessMessage("Added to cart.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }} />

      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
