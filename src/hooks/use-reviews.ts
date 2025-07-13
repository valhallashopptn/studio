
'use client';

import { create } from 'zustand';
import type { Review } from '@/lib/types';
import { createClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

type ReviewsState = {
  reviews: Review[];
  isLoading: boolean;
  fetchReviews: () => Promise<void>;
  addReview: (review: Omit<Review, 'id'>) => Promise<void>;
  hasReviewed: (productName: string, userName: string) => boolean;
};

export const useReviews = create<ReviewsState>((set, get) => ({
      reviews: [],
      isLoading: true,
      fetchReviews: async () => {
        const supabase = createClient();
        set({ isLoading: true });
        const { data, error } = await supabase.from('reviews').select('*');
        if (error) {
            console.error("Error fetching reviews:", error);
            set({ reviews: [], isLoading: false });
        } else {
            set({ reviews: data, isLoading: false });
        }
      },
      addReview: async (newReviewData) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('reviews').insert([newReviewData]).select();
        if (error) {
            console.error("Error adding review:", error);
        } else if (data) {
            set((state) => ({ reviews: [data[0], ...state.reviews] }));
        }
      },
      hasReviewed: (productName, userName) => {
        const { reviews } = get();
        return reviews.some(
          (review) => review.product === productName && review.name === userName
        );
      },
    })
);

export function ReviewsInitializer() {
    const { isInitialized } = useAuth();
    useEffect(() => {
        if (isInitialized) {
            useReviews.getState().fetchReviews();
        }
    }, [isInitialized]);
    
    return null;
}
