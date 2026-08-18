import type { MenuItem } from "@user/types/menu";

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Tea",
    price: 1200,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop",
    canteen: 1,
    category: "drinks",
    description: "Hot Myanmar tea served fresh. Perfect with snacks.",
  },
  {
    id: 2,
    name: "Pizza",
    price: 4500,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    canteen: 1,
    category: "main",
    description: "Cheesy slice with tomato sauce and herbs. Student favorite.",
  },
  {
    id: 3,
    name: "Fish Burger",
    price: 4500,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    canteen: 1,
    category: "main",
    description:
      "Crispy fish fillet with lettuce and special sauce in a soft bun.",
  },
  {
    id: 4,
    name: "Fried Rice",
    price: 3500,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    canteen: 2,
    category: "main",
    description:
      "Wok-fried rice with vegetables and egg. Filling lunch option.",
  },
  {
    id: 5,
    name: "Bubble Tea",
    price: 2500,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1558857563-c0c4a0b1f3b0?w=400&h=300&fit=crop",
    canteen: 2,
    category: "drinks",
    description: "Sweet milk tea with chewy tapioca pearls. Served cold.",
  },
  {
    id: 6,
    name: "Sandwich",
    price: 3000,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    canteen: 2,
    category: "snacks",
    description: "Fresh bread with ham, cheese, and vegetables. Light meal.",
  },
  {
    id: 7,
    name: "Coffee",
    price: 1800,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    canteen: 1,
    category: "drinks",
    description: "Freshly brewed coffee to keep you energized during class.",
  },
  {
    id: 8,
    name: "Chicken Curry",
    price: 4000,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
    canteen: 2,
    category: "main",
    description: "Tender chicken in rich curry sauce with steamed rice.",
  },
  {
    id: 9,
    name: "Spring Rolls",
    price: 2200,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172ceeb?w=400&h=300&fit=crop",
    canteen: 1,
    category: "snacks",
    description:
      "Crispy rolls filled with vegetables. Served with dipping sauce.",
  },
];

export const foodCategories = [
  { id: "all", label: "All" },
  { id: "main", label: "Main" },
  { id: "drinks", label: "Drinks" },
  { id: "snacks", label: "Snacks" },
] as const;

export function getMenuItemById(id: number): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}
