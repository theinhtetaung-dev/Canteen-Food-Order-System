import type { HeroSlide } from "@user/types/menu";
import heroImg from "../../assets/hero.png";

export const heroSlides: HeroSlide[] = [
  {
    name: "Special Meal",
    rating: 0.0,
    image: heroImg,
    description: "From crispy fresh salads to warm, nourishing classics—we serve balanced meals that students love and parents trust.",
  },
  {
    name: "Fried Rice",
    rating: 0.0,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=500&fit=crop",
    description: "Wok-fried rice with vegetables and egg. Filling lunch option.",
  },
  {
    name: "Pizza",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop",
    description: "Cheesy slice with tomato sauce and herbs. Student favorite.",
  },
];
