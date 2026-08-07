import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, UtensilsCrossed, Search, ArrowRight } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { heroSlides } from "@furniture/data/heroItems";
import { useAuth } from "@furniture/hooks/useAuth";

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slide = heroSlides[currentSlide];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Main Content */}
      <main className="flex-1 px-8 lg:px-12 py-12 lg:py-20 flex items-center justify-center">
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* Left Column */}
          <div className="animate-fadeIn space-y-8">
            <div className="inline-flex items-center rounded-full bg-brand-light/50 px-4 py-2">
              <span className="text-sm font-medium text-brand">
                Hello, Student 👋
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-brand sm:text-5xl lg:text-6xl">
              Making School Lunches<br />
              the Best Part of the Day.
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-gray-500">
              From crispy fresh salads to warm, nourishing classics—we serve
              balanced meals that students love and parents trust.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/furniture/menu"
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Our Menu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/furniture/menu"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
              >
                <ShoppingCart className="h-4 w-4" />
                Order Now
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-6">
              <div className="flex min-w-[120px] flex-col rounded-2xl border-2 border-brand-light bg-white p-4 shadow-sm">
                <span className="text-2xl font-black text-gray-900">54+</span>
                <span className="text-xs font-medium text-gray-500">Menu Items</span>
              </div>
              <div className="flex min-w-[120px] flex-col rounded-2xl border-2 border-brand-light bg-white p-4 shadow-sm">
                <span className="text-2xl font-black text-gray-900">4.8</span>
                <span className="text-xs font-medium text-gray-500">Avg Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative flex min-h-[400px] items-center justify-center lg:min-h-[500px]">
            {/* Background decorative circles */}
            <div className="absolute h-[340px] w-[340px] rounded-full bg-brand-light/30 sm:h-[450px] sm:w-[450px] lg:h-[550px] lg:w-[550px]" />
            <div className="absolute h-[300px] w-[300px] rounded-full bg-white shadow-xl sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px]" />
            
            {/* Main Image */}
            <div className="relative z-10 animate-fadeIn">
              <img
                src={slide?.image || "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                alt={slide?.name || "Fried Rice"}
                className="h-[280px] w-[280px] rounded-full object-cover shadow-2xl sm:h-[380px] sm:w-[380px] lg:h-[440px] lg:w-[440px]"
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-12 right-4 z-20 animate-fadeIn rounded-2xl bg-white px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:bottom-16 sm:right-12 lg:bottom-20 lg:right-16">
              <p className="text-sm font-bold text-gray-800">{slide?.name || "Fried Rice"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-black text-gray-900">{slide?.rating || "4.8"}</span>
                <Star className="h-4 w-4 fill-brand text-brand" />
              </div>
            </div>

            {/* Slider Dots (Decorative for now to match design) */}
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-light" />
              <div className="h-2 w-6 rounded-full bg-brand" />
              <div className="h-2 w-2 rounded-full bg-brand-light" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function DashboardHome() {
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

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <DashboardHome />;
  }
  
  return <LandingPage />;
}
