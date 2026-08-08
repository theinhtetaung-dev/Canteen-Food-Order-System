import { api } from "@furniture/api/axios";
import type { MenuItem } from "@furniture/types/menu";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data } = await api.get<any[]>("/api/foods");
  
  return data.map((item) => {
    return {
      id: item.foodId,
      name: item.foodName,
      price: Number(item.price),
      rating: 4.8, // default rating
      image: item.imageUrl ? (item.imageUrl.startsWith("http") ? item.imageUrl : `${baseUrl}${item.imageUrl}`) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
      canteen: (item.foodId % 2 === 0) ? 2 : 1, // distribute items between canteens
      category: item.categoryName || "Snacks",
      categoryId: item.categoryId,
      isAvailable: item.isAvailable !== false,
      description: item.description || "",
    } as any;
  });
}

export async function fetchMenuByCanteen(canteenId: number): Promise<MenuItem[]> {
  const items = await fetchMenuItems();
  return items.filter((item) => item.canteen === canteenId);
}

export async function createMenuItem(payload: {
  foodName: string;
  price: number;
  categoryId: number;
  description?: string;
  isAvailable: boolean;
  imageFile?: File | null;
}): Promise<any> {
  const formData = new FormData();
  
  const jsonBlob = new Blob([JSON.stringify({
    foodName: payload.foodName,
    price: payload.price,
    categoryId: payload.categoryId,
    description: payload.description || "",
    isAvailable: payload.isAvailable
  })], { type: "application/json" });
  
  formData.append("data", jsonBlob);
  
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await api.post("/api/foods", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function updateMenuItem(
  id: string | number,
  payload: {
    foodName: string;
    price: number;
    categoryId: number;
    description?: string;
    isAvailable: boolean;
    imageFile?: File | null;
  }
): Promise<any> {
  const formData = new FormData();
  
  const jsonBlob = new Blob([JSON.stringify({
    foodName: payload.foodName,
    price: payload.price,
    categoryId: payload.categoryId,
    description: payload.description || "",
    isAvailable: payload.isAvailable
  })], { type: "application/json" });
  
  formData.append("data", jsonBlob);
  
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await api.put(`/api/foods/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteMenuItem(id: string | number): Promise<void> {
  await api.delete(`/api/foods/${id}`);
}
