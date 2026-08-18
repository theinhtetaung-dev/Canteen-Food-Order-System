import { api } from "@user/api/axios";

export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
  createdByName?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/api/food-categories");
  return data;
}

export async function createCategory(payload: { categoryName: string; description: string }): Promise<Category> {
  const { data } = await api.post<Category>("/api/food-categories", payload);
  return data;
}

export async function updateCategory(id: number, payload: { categoryName: string; description: string }): Promise<Category> {
  const { data } = await api.put<Category>(`/api/food-categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/api/food-categories/${id}`);
}
