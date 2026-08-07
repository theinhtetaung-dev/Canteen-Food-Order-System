import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { heroSlides } from "@furniture/data/heroItems";
import { useAuth } from "@furniture/hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  };

  const slide = heroSlides[currentSlide];

  return (
    <PageContainer className="flex items-center">
      <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="animate-fadeIn space-y-6">
          <span className="inline-block rounded-full border border-brand/30 bg-brand-muted px-6 py-2 text-sm font-medium text-brand-dark">
            Hello {user?.name || 'Student'} 👋
          </span>

          <h1 className="text-3xl font-bold leading-tight text-brand sm:text-4xl lg:text-5xl">
            Making School Lunches
            <br />
            the Best Part of the Day.
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
            From crispy fresh salads to warm, nourishing classics—we serve
            balanced meals that students love and parents trust.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/furniture/menu"
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lg"
            >
              Our Menu
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/furniture/menu"
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-md transition-all duration-300 hover:bg-gray-50 hover:shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Order Now
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="rounded-xl border border-brand bg-white px-5 py-3 shadow-md">
              <span className="text-2xl font-bold text-gray-800">54+</span>
              <p className="text-xs text-gray-500">Menu Items</p>
            </div>
            <div className="rounded-xl border border-brand bg-white px-5 py-3 shadow-md">
              <span className="text-2xl font-bold text-gray-800">4.8</span>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[300px] items-center justify-center sm:min-h-[400px]">
          <div className="absolute h-64 w-64 rounded-full bg-brand/5 sm:h-80 sm:w-80 lg:h-96 lg:w-96" />

          <div
            className={`relative z-10 transition-all duration-500 ${isAnimating ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}
          >
            <img
              src={slide.image}
              alt={slide.name}
              className="h-56 w-56 rounded-full border-4 border-white object-cover shadow-2xl sm:h-72 sm:w-72 lg:h-80 lg:w-80"
            />
          </div>

          <div
            className={`absolute bottom-4 right-4 rounded-xl border border-b-brand bg-white px-4 py-2 shadow-lg transition-all duration-500 sm:bottom-8 sm:right-8 ${isAnimating ? "translate-x-4 opacity-0" : "translate-x-0 opacity-100"}`}
          >
            <p className="text-sm font-semibold text-gray-800">{slide.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-gray-800">
                {slide.rating}
              </span>
              <Star className="h-4 w-4 fill-brand text-brand" />
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-brand"
                    : "w-2.5 bg-brand/40 hover:bg-brand"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
