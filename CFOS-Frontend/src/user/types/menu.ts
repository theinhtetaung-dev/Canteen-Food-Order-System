export type FoodCategory = "drinks" | "main" | "snacks";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  canteen: number;
  category: FoodCategory;
  description: string;
  isAvailable?: boolean;
}

export interface Review {
  id: number;
  name: string;
  idCode: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface HeroSlide {
  name: string;
  rating: number;
  image: string;
  description?: string;
}

