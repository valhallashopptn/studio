
'use client';

import { create } from 'zustand';
import type { Category } from '@/lib/types';
import { useEffect } from 'react';

type CategoriesState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: true,
  error: null,
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      set({ categories: data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false });
    }
  },
  addCategory: async (categoryData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error('Failed to create category');
      const newCategory = await response.json();
      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (error) {
      console.error("Failed to add category:", error);
      // Here you could set an error state to show in the UI
    }
  },
  updateCategory: async (updatedCategory) => {
    // This would make a PUT request to `/api/categories/${updatedCategory.id}`
    set((state) => ({
        categories: state.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
    }));
  },
  deleteCategory: async (categoryId) => {
    // This would make a DELETE request to `/api/categories/${categoryId}`
    set((state) => ({
        categories: state.categories.filter(c => c.id !== categoryId)
    }));
  },
}));


// Custom hook to initialize the store on client side
export const useCategories = () => {
  const store = useCategoriesStore();

  useEffect(() => {
    // Fetch initial data when the component using the hook mounts
    store.fetchCategories();
  }, []);

  return store;
};
