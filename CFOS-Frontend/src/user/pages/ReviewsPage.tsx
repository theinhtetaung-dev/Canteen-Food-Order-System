import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Star, Edit2, Trash2, Plus, Loader2, X } from "lucide-react";
import { PageContainer } from "@user/components/layout/PageContainer";
import { useAuth } from "@user/hooks/useAuth";
import { useMediaQuery } from "@user/hooks/useMediaQuery";
import { cn } from "@user/lib/utils";
import { Link } from "react-router-dom";
import {
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
  type Review
} from "@user/api/review.api";

export default function ReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filtering & Sorting State
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "highest">("latest");

  // Form & Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviews();
      setReviewsList(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);



  const handleOpenCreateModal = () => {
    setEditingReview(null);
    setFormRating(5);
    setFormText("");
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (review: Review) => {
    setEditingReview(review);
    setFormRating(review.rating);
    setFormText(review.reviewText);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setFormRating(5);
    setFormText("");
    setSubmitError(null);
    setHoverRating(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) {
      setSubmitError("Review content cannot be empty.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingReview) {
        await updateReview(editingReview.reviewId, {
          rating: formRating,
          reviewText: formText,
        });
      } else {
        await createReview({
          rating: formRating,
          reviewText: formText,
        });
      }
      handleCloseModal();
      await loadReviews();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const totalReviews = reviewsList.length;
  const averageRating = totalReviews > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviewsList.filter((r) => Math.round(r.rating) === stars).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { stars, count, percentage };
    });
  }, [reviewsList, totalReviews]);

  const processedReviews = useMemo(() => {
    let list = [...reviewsList];

    // 1. Filter by Tab
    if (activeTab === "my" && user) {
      list = list.filter((r) => r.userName === user.rollNumber);
    }

    // 2. Filter by Rating
    if (ratingFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === ratingFilter);
    }

    // 3. Sort
    if (sortBy === "latest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [reviewsList, activeTab, ratingFilter, sortBy, user]);

  const visibleCount = isMobile ? 1 : 3;
  const totalProcessed = processedReviews.length;
  const maxIndex = Math.max(0, totalProcessed - visibleCount);

  const visibleReviews = processedReviews.slice(
    currentIndex,
    currentIndex + visibleCount,
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Reset pagination index when list length or filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [totalProcessed]);

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            Community feedback and ratings for the MIIT Canteen
          </p>
        </div>
        <div className="shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Write a Review
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-all shadow-sm"
            >
              Login to Review
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        {/* Card 1: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Average Rating</span>
          <div className="flex items-center gap-2.5">
            <span className="text-4xl font-black text-gray-900">{averageRating}</span>
            <div className="flex flex-col items-start">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(Number(averageRating))
                        ? "fill-brand text-brand"
                        : "text-gray-200",
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Out of 5.0 stars</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Reviews</span>
          <span className="text-4xl font-black text-gray-900">{totalReviews}</span>
          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Verified canteen reviews</span>
        </div>

        {/* Card 3: Rating Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center space-y-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rating Distribution</span>
          <div className="space-y-1">
            {ratingCounts.map(({ stars, percentage }) => (
              <div key={stars} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="w-3 text-right">{stars}★</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 font-mono">{Math.round(percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtering & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            All Reviews
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setActiveTab("my")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                activeTab === "my"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
            )}
          >
            My Reviews
          </button>
        )}
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Rating Filter Chips */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-400 mr-1">Rating:</span>
            <button
              type="button"
              onClick={() => setRatingFilter(null)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer",
                ratingFilter === null
                  ? "border-brand bg-brand-light/30 text-brand-dark"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(stars)}
                className={cn(
                  "flex items-center gap-0.5 px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer",
                  ratingFilter === stars
                    ? "border-brand bg-brand-light/30 text-brand-dark"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                {stars}★
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 font-semibold focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="highest">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={loadReviews}
            className="mt-3 text-sm font-bold text-brand hover:underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : totalReviews === 0 ? (
        /* Global Empty State */
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center max-w-xl mx-auto space-y-5 my-8">
          <div className="bg-brand-light/20 p-4 rounded-full border border-brand-light/30 text-brand">
            <Star className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">No reviews yet</h3>
            <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
              Be the first to share your experience with MIIT Canteen!
            </p>
          </div>
          <div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Write the First Review
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-all shadow-sm"
              >
                Login to Review
              </Link>
            )}
          </div>
        </div>
      ) : totalProcessed === 0 ? (
        /* Filtered Empty State */
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center max-w-xl mx-auto space-y-4 my-8">
          <div className="bg-gray-50 p-4 rounded-full border border-gray-100 text-gray-400">
            <Star className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">No matching reviews</h3>
            <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
              No reviews match the selected rating or filters. Try choosing "All" or writing a new one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setRatingFilter(null); setActiveTab("all"); }}
            className="text-xs font-bold text-brand hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Review cards list */
        <>
          <div className="mb-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 transition-all duration-300 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 transition-all duration-300 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
                key={review.reviewId}
                className="animate-fadeIn rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand border-2 border-brand/20">
                        {getInitials(review.userFullName || review.userName)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                          {review.userFullName || review.userName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-mono">{review.userName}</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user && (review.userName === user.rollNumber || user.role === 'admin' || user.role === 'superadmin') && (
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(review)}
                          className="p-1 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all cursor-pointer"
                          title="Edit review"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review.reviewId)}
                          className="p-1 text-gray-450 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
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

                  <p className="text-sm leading-relaxed text-gray-500 break-words whitespace-pre-line">
                    {review.reviewText}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Write/Edit Review Modal */}
      {isModalOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-label="Close modal overlay"
          />
          <div className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingReview ? "Edit Review" : "Write a Review"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          star <= (hoverRating ?? formRating)
                            ? "fill-brand text-brand"
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your Review
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Share your dining experience..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-450 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingReview ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Review Confirmation Modal */}
      {deleteConfirmId !== null && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
            aria-label="Close modal overlay"
          />
          <div className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn space-y-6">
            <div className="flex items-center gap-2 text-gray-900 font-extrabold pb-3 border-b border-gray-100">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h2 className="text-lg">Delete Review</h2>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  try {
                    await deleteReview(id);
                    await loadReviews();
                  } catch (err: any) {
                    console.error(err);
                    alert("Failed to delete review. Please try again.");
                  }
                }}
                className="bg-[#C5221F] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#A81B18] transition-colors shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
