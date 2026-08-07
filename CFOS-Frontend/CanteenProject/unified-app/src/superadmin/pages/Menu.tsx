import React, { useState, useMemo, useRef, useEffect } from "react";
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@furniture/api/menu.api";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  Camera,
  UploadCloud,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react";

type CategoryType =
  | "Salads"
  | "Main Course"
  | "Beverages"
  | "Desserts"
  | "Breakfast"
  | "Snacks";

interface MenuItem {
  id: string;
  name: string;
  category: CategoryType;
  price: number;
  available: boolean;
  image: string;
  description?: string;
}

const CATEGORIES: CategoryType[] = [
  "Salads",
  "Main Course",
  "Beverages",
  "Desserts",
  "Breakfast",
  "Snacks",
];

const FILTER_CATEGORIES = ["All Categories", ...CATEGORIES];

const SORT_OPTIONS = [
  { label: "Sort by: Default", value: "default" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Mohinga",
    category: "Breakfast",
    price: 5000,
    available: true,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
    description:
      "Fluffy quinoa, bright cherry tomatoes, cucumber, Kalamata olives, and a dollop of creamy hummus, garnished with fresh parsley.",
  },
  {
    id: "2",
    name: "Angus Classic Burger",
    category: "Main Course",
    price: 6500,
    available: true,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300",
    description:
      "Juicy beef patty served with melted cheddar and caramelized onions.",
  },
  {
    id: "3",
    name: "Iced Matcha Latte",
    category: "Beverages",
    price: 4000,
    available: true,
    image:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=300",
    description: "Ceremonial grade matcha whisked with fresh oat milk.",
  },
  {
    id: "4",
    name: "Chocolate Lava Cake",
    category: "Desserts",
    price: 4500,
    available: false,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=300",
    description: "Warm chocolate cake with a rich molten center.",
  },
  {
    id: "5",
    name: "Herb Roasted Chicken",
    category: "Main Course",
    price: 8000,
    available: true,
    image:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=300",
    description: "Oven roasted half chicken served with seasonal greens.",
  },
];

const categoryStyles: Record<CategoryType, string> = {
  Salads: "bg-[#e2f5ec] text-[#1e724d]",
  "Main Course": "bg-[#e0f7ed] text-[#1b7a53]",
  Beverages: "bg-[#f2f8d5] text-[#557317]",
  Desserts: "bg-[#fde8e8] text-[#9b2c2c]",
  Breakfast: "bg-[#e8f3d6] text-[#4f6f1c]",
  Snacks: "bg-[#fef3c7] text-[#854d0e]",
};


export function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        setIsLoading(true);
        const data = await fetchMenuItems();
        const mapped = data.map((d: any) => ({
          id: String(d.id),
          name: d.name,
          price: d.price,
          category: (d.category === 'main' ? 'Main Course' : d.category === 'drinks' ? 'Beverages' : 'Snacks') as CategoryType,
          description: d.description,
          available: true,
          image: d.image
        }));
        setItems(mapped);
      } catch (error) {
        console.error("Failed to load menu", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("default");

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] =
    useState<CategoryType>("Main Course");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemImage, setNewItemImage] = useState<string | null>(null);

  const [startIndex, setStartIndex] = useState(0);
  const ITEMS_PER_PAGE = 5;

  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        sortRef.current &&
        !sortRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      try {
        await deleteMenuItem(deletingItem.id);
        setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
      } catch (error) {
        console.error("Failed to delete menu item", error);
      } finally {
        setDeletingItem(null);
      }
    }
  };

  const handleResetMenu = () => {
    // We cannot reset the menu easily with real backend, so we'll just reload
    window.location.reload();
  };

  const handleAddImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewItemImage(URL.createObjectURL(file));
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      setEditingItem({ ...editingItem, image: URL.createObjectURL(file) });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    try {
      const saved = await createMenuItem({
        name: newItemName,
        price: Number(newItemPrice),
        category: newItemCategory as any,
        description: newItemDescription,
        image: newItemImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
      } as any);

      const newItem: MenuItem = {
        id: String(saved.id),
        name: saved.name,
        price: saved.price,
        category: newItemCategory,
        description: saved.description,
        available: true,
        image: saved.image,
      };

      setItems((prev) => [newItem, ...prev]);
      setNewItemName("");
      setNewItemPrice("");
      setNewItemCategory("Main Course");
      setNewItemDescription("");
      setNewItemImage(null);
      setIsAddModalOpen(false);
      setStartIndex(0);
    } catch (error) {
      console.error("Failed to add menu item", error);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: editingItem.name,
        price: editingItem.price,
        category: editingItem.category as any,
        description: editingItem.description,
        image: editingItem.image,
      } as any);

      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? editingItem : item))
      );
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to edit menu item", error);
    }
  };

  const processedItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [items, searchQuery, selectedCategory, sortBy]);

  const filteredCategories = FILTER_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const visibleItems = processedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalCount = processedItems.length;

  return (
    <div className="w-full p-8 space-y-6 bg-[#fdfefb] min-h-screen relative font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Menu Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage campus food offerings, prices, and availability.
          </p>
        </div>

        {/* Global Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setStartIndex(0);
              }}
              className="pl-10 pr-4 py-2 bg-[#f1f3ee] border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 w-64 transition-all"
            />
          </div>

          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f1f3ee] border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-white transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span>
                {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 py-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? "bg-[#f4f8ee] text-[#518218] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Table Card */}
      <div className="bg-white rounded-3xl border border-emerald-100/60 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-[#fbfdf8]">
          <div className="relative" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <span>{selectedCategory}</span>
              {isCategoryOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500 ml-3" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 ml-3" />
              )}
            </button>

            {isCategoryOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 p-2 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#f8faf6] border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                        setStartIndex(0);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#f4f8ee] text-[#4f6f1c]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetMenu}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#518218] text-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3f6711] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* 3. Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-600 bg-[#fafcf7]">
                <th className="py-4 px-6 w-28">Image</th>
                <th className="py-4 px-6">Item Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6 text-center">Available</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {visibleItems.length > 0 ? (
                visibleItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#fbfdf8]/80 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-100"
                      />
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400 line-clamp-1 max-w-xs font-normal">
                          {item.description}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          categoryStyles[item.category]
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-[#3a6810]">
                      {item.price.toLocaleString()} KS
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          item.available ? "bg-[#4a6b18]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.available ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit Item"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-500 font-medium"
                  >
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      No menu items found
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Click "Reset Defaults" or "Add New Item" to populate the menu.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetMenu}
                      className="px-4 py-2 bg-[#518218] text-white rounded-xl text-xs font-bold hover:bg-[#3f6711] transition-colors"
                    >
                      Restore Default Menu
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-[#fafcf7] flex items-center justify-between text-xs text-gray-500">
          <div>
            {totalCount > 0
              ? `${startIndex + 1}-${Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  totalCount
                )} of ${totalCount}`
              : "0 of 0"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setStartIndex((p) => Math.max(0, p - ITEMS_PER_PAGE))
              }
              disabled={startIndex === 0}
              className="p-1 hover:text-gray-900 disabled:opacity-30 transition-opacity"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStartIndex((p) => Math.max(0, p - 1))}
              disabled={startIndex === 0}
              className="p-1 hover:text-gray-900 disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setStartIndex((p) =>
                  Math.min(totalCount - ITEMS_PER_PAGE, p + 1)
                )
              }
              disabled={startIndex + ITEMS_PER_PAGE >= totalCount}
              className="p-1 hover:text-gray-900 disabled:opacity-30 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setStartIndex((p) =>
                  Math.min(
                    Math.max(0, totalCount - ITEMS_PER_PAGE),
                    p + ITEMS_PER_PAGE
                  )
                )
              }
              disabled={startIndex + ITEMS_PER_PAGE >= totalCount}
              className="p-1 hover:text-gray-900 disabled:opacity-30 transition-opacity"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. EXACT DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-[1.5px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[26px] w-[380px] shadow-2xl overflow-hidden border border-gray-100/50 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Content Wrapper */}
            <div className="p-7 pb-6">
              {/* Header: Icon + Title in One Line */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#fdeded] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#c51d24]" />
                </div>
                <h3 className="text-[21px] font-extrabold text-[#b81d22] tracking-tight">
                  Delete Menu Item?
                </h3>
              </div>

              {/* Description Paragraph */}
              <div className="text-[13px] text-gray-700 leading-[1.6] font-medium tracking-normal mb-6">
                Are you sure you want to delete "{deletingItem.name}"?
                <br />
                This action cannot be undone.
              </div>

              {/* Action Buttons Right-Aligned */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="px-6 py-2 bg-white border border-gray-300/90 hover:bg-gray-50 text-gray-700 rounded-xl text-[13px] font-medium transition-colors shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-[#be1818] hover:bg-[#a31212] text-white rounded-xl text-[13px] font-medium transition-colors shadow-none"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Bottom Warning Bar */}
            <div className="bg-[#f2f3ed] py-3.5 px-6 border-t border-gray-200/50 flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-[#5b5c56] uppercase">
              <Info className="w-3.5 h-3.5 text-[#5b5c56] shrink-0" />
              <span>GLOBAL MENU UPDATE WARNING</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Menu Item
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <input
                  type="file"
                  ref={addFileInputRef}
                  onChange={handleAddImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => addFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-emerald-500 bg-[#fbfdf8] rounded-2xl h-36 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
                >
                  {newItemImage ? (
                    <>
                      <img
                        src={newItemImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewItemImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Camera className="w-7 h-7" />
                      <span className="text-xs font-semibold">
                        Upload Item Image
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Salmon Salad"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f5f7f2] border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Price (KS)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f5f7f2] border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) =>
                      setNewItemCategory(e.target.value as CategoryType)
                    }
                    className="w-full px-4 py-2.5 bg-[#f5f7f2] border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the ingredients and dietary info..."
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f5f7f2] border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#518218] hover:bg-[#3f6711] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EDIT ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Menu Item</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">
                    Item Photo
                  </label>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleEditImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="relative group h-44 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer shadow-inner"
                  >
                    <img
                      src={editingItem.image}
                      alt={editingItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center text-white">
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-black/60 transition-colors">
                        <UploadCloud className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Change Image</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.name}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#f4f6f0] border border-gray-200/80 rounded-xl text-sm font-medium text-gray-800 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          category: e.target.value as CategoryType,
                        })
                      }
                      className="w-full px-4 py-2 bg-[#f4f6f0] border border-gray-200/80 rounded-xl text-sm font-medium text-gray-800 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
                      Price (MMK)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingItem.price}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 bg-[#f4f6f0] border border-gray-200/80 rounded-xl text-sm font-medium text-gray-800 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-[#f4f6f0] border border-gray-200/80 rounded-2xl text-xs font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4b6a18] hover:bg-[#3d5713] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;