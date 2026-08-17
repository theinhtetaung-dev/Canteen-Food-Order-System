import { api } from "@user/api/axios";

export interface Review {
  reviewId: number;
  userId: number;
  userName: string;
  userFullName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequestPayload {
  rating: number;
  reviewText: string;
}

export async function fetchReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[]>("/api/reviews");
  return data;
}

export async function createReview(payload: ReviewRequestPayload): Promise<Review> {
  const { data } = await api.post<Review>("/api/reviews", payload);
  return data;
}

export async function updateReview(id: number, payload: ReviewRequestPayload): Promise<Review> {
  const { data } = await api.put<Review>(`/api/reviews/${id}`, payload);
  return data;
}

export async function deleteReview(id: number): Promise<void> {
  await api.delete(`/api/reviews/${id}`);
}
