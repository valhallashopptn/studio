
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/lib/types';
import { categories as initialCategories } from '@/lib/data';

type CategoriesState = {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
};

export const useCategories = create(
  persist<CategoriesState>(
    (set) => ({
      categories: initialCategories,
      addCategory: (categoryData) => set((state) => ({
          categories: [...state.categories, { id: `cat_${Date.now()}`, ...categoryData }]
      })),
      updateCategory: (updatedCategory) => set((state) => ({
          categories: state.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      })),
      deleteCategory: (categoryId) => set((state) => ({
          categories: state.categories.filter(c => c.id !== categoryId)
      })),
    }),
    {
      name: 'topup-hub-categories',
    }
  )
);
