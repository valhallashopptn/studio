'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review } from '@/lib/types';
import { reviews as initialReviews } from '@/lib/data';

type ReviewsState = {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'avatar'>) => void;
};

export const useReviews = create(
  persist<ReviewsState>(
    (set) => ({
      reviews: initialReviews,
      addReview: (newReviewData) =>
        set((state) => {
            const newReview: Review = {
                id: `rev_${Date.now()}`,
                avatar: `https://placehold.co/100x100.png`,
                ...newReviewData
            };
            return { reviews: [newReview, ...state.reviews] };
        }),
    }),
    {
      name: 'topup-hub-reviews',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as ReviewsState;
        if (!persisted || !persisted.reviews) {
          return currentState;
        }

        const staticReviewIds = new Set(currentState.reviews.map(r => r.id));
        const userAddedReviews = persisted.reviews.filter(r => !staticReviewIds.has(r.id));
        
        return {
          ...currentState,
          reviews: [...currentState.reviews, ...userAddedReviews]
        }
      }
    }
  )
);
