import { useRef, useState, useEffect, type MouseEvent } from "react";
import type { FoodCategory } from "@furniture/types/menu";
import { foodCategories } from "@furniture/data/menuItems";
import { cn } from "@furniture/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryFilterProps {
  activeCategory: FoodCategory | "all";
  onChange: (category: FoodCategory | "all") => void;
}

export function CategoryFilter({
  activeCategory,
  onChange,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Drag-to-scroll state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // scrollWidth က clientWidth ထက် ကြီးနေမှသာ Overflow ဖြစ်ပြီး Scroll ရတာပါ
      // Pixel တွက်ချက်မှု တိကျစေရန် Math.ceil သုံးထားပါသည်
      const hasOverflow = scrollWidth > clientWidth;

      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(
        hasOverflow && Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2,
      );
    }
  };

  // 1. Category တွေ ပြောင်းလဲတိုင်း သို့မဟုတ် Window Resize လုပ်တိုင်း checkScroll လုပ်မည်
  useEffect(() => {
    // DOM render ပြီးစီးအောင် ခဏစောင့်ပြီး စစ်ပေးရန်
    const timer = setTimeout(() => {
      checkScroll();
    }, 100);

    window.addEventListener("resize", checkScroll);

    // 2. ResizeObserver သုံးပြီး Container အရွယ်အစားပြောင်းလဲမှုကို အမြဲ စောင့်ကြည့်မည်
    let observer: ResizeObserver | null = null;
    if (scrollContainerRef.current) {
      observer = new ResizeObserver(() => checkScroll());
      observer.observe(scrollContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
      if (observer) observer.disconnect();
    };
  }, [foodCategories]); // foodCategories ပြောင်းတိုင်း ပြန်စစ်ပါမည်

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 350);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }

    scrollContainerRef.current.scrollLeft = startScrollLeft - walk;
  };

  const handleCategoryClick = (categoryId: FoodCategory | "all") => {
    if (isDragging) return;
    onChange(categoryId);
  };

  return (
    <div className="relative flex items-center justify-center w-full px-8 sm:px-10">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-brand transition-all border border-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Main Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          "flex items-center gap-2 overflow-x-auto py-2 select-none scroll-smooth w-full",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          isMouseDown ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <div className="flex items-center gap-2 m-auto w-max px-2">
          {foodCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 flex-shrink-0",
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "bg-brand-light/60 text-gray-600 hover:bg-brand-light hover:text-brand-dark",
                )}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-brand transition-all border border-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
