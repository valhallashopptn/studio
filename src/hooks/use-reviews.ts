
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review } from '@/lib/types';
import { reviews as initialReviews } from '@/lib/data';

type ReviewsState = {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'avatar'>) => void;
  hasReviewed: (productName: string, userName: string) => boolean;
};

export const useReviews = create(
  persist<ReviewsState>(
    (set, get) => ({
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
      hasReviewed: (productName, userName) => {
        const { reviews } = get();
        return reviews.some(
          (review) => review.product === productName && review.name === userName
        );
      },
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
