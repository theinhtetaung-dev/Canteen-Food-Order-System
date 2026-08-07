import { api } from "@furniture/api/axios";
import type { MenuItem } from "@furniture/types/menu";

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data } = await api.get<any[]>("/api/foods");
  
  return data.map((item) => {
    // Map category name to frontend category
    let category: "main" | "drinks" | "snacks" = "snacks";
    const catName = (item.categoryName || "").toLowerCase();
    
    if (catName.includes("main") || catName.includes("course")) {
      category = "main";
    } else if (
      catName.includes("beverage") || 
      catName.includes("drink") || 
      catName.includes("tea") || 
      catName.includes("coffee")
    ) {
      category = "drinks";
    }

    return {
      id: item.foodId,
      name: item.foodName,
      price: Number(item.price),
      rating: 4.8, // default rating
      image: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
      canteen: (item.foodId % 2 === 0) ? 2 : 1, // distribute items between canteens
      category: category,
      description: item.description || "",
    };
  });
}

export async function fetchMenuByCanteen(canteenId: number): Promise<MenuItem[]> {
  const items = await fetchMenuItems();
  return items.filter((item) => item.canteen === canteenId);
}

export async function createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
  const res = await api.post("/api/foods", {
    foodName: data.name,
    price: data.price,
    categoryName: data.category,
    description: data.description,
    imageUrl: data.image,
  });
  return res.data;
}

export async function updateMenuItem(id: string | number, data: Partial<MenuItem>): Promise<MenuItem> {
  const res = await api.put(`/api/foods/${id}`, {
    foodName: data.name,
    price: data.price,
    categoryName: data.category,
    description: data.description,
    imageUrl: data.image,
  });
  return res.data;
}

export async function deleteMenuItem(id: string | number): Promise<void> {
  await api.delete(`/api/foods/${id}`);
}
