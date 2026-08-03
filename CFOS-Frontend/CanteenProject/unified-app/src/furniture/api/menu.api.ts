import { api } from "@furniture/api/axios";
import { menuItems } from "@furniture/data/menuItems";
import type { MenuItem } from "@furniture/types/menu";

const USE_MOCK = true;

export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (USE_MOCK) {
    return Promise.resolve(menuItems);
  }

  const { data } = await api.get<MenuItem[]>("/menu");
  return data;
}

export async function fetchMenuByCanteen(canteenId: number): Promise<MenuItem[]> {
  const items = await fetchMenuItems();
  return items.filter((item) => item.canteen === canteenId);
}
