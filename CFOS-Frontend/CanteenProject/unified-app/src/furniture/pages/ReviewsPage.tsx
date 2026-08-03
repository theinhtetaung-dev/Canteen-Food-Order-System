import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { PageContainer } from "@furniture/components/layout/PageContainer";
import { reviews } from "@furniture/data/reviews";
import { useMediaQuery } from "@furniture/hooks/useMediaQuery";
import { cn } from "@furniture/lib/utils";

export default function ReviewsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const visibleReviews = reviews.slice(
    currentIndex,
    currentIndex + visibleCount,
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <PageContainer>
      <h1 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
        <span className="text-brand">Customers</span>{" "}
        <span className="text-gray-800 underline decoration-brand decoration-2 underline-offset-4">
          Saying
        </span>
      </h1>

      <div className="mb-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 transition-all duration-300 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 transition-all duration-300 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        className={cn(
          "grid gap-6 lg:gap-8",
          isMobile ? "grid-cols-1" : "grid-cols-3",
        )}
      >
        {visibleReviews.map((review, index) => (
          <article
            key={review.id}
            className="animate-fadeIn rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="mb-4 flex items-center gap-3">
              <img
                src={review.avatar}
                alt={review.name}
                className="h-12 w-12 rounded-full border-2 border-brand/20 object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{review.name}</h3>
                <p className="text-xs text-gray-400">{review.idCode}</p>
              </div>
            </div>

            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(review.rating)
                      ? "fill-brand text-brand"
                      : "text-gray-200",
                  )}
                />
              ))}
            </div>

            <p className="text-sm leading-relaxed text-gray-500">
              {review.text}
            </p>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
