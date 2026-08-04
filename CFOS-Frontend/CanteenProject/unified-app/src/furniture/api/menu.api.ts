import { api } from "@furniture/api/axios";
import type { MenuItem } from "@furniture/types/menu";

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data } = await api.get<MenuItem[]>("/api/foods");
  return data;
}

export async function fetchMenuByCanteen(canteenId: number): Promise<MenuItem[]> {
  const { data } = await api.get<MenuItem[]>(`/api/foods/category/${canteenId}`);
  return data;
}
