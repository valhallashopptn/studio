
'use client';

import { create } from 'zustand';
import type { Category } from '@/lib/types';
import { createClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

type CategoriesState = {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
};

export const useCategories = create<CategoriesState>((set, get) => ({
    categories: [],
    isLoading: true,
    fetchCategories: async () => {
        const supabase = createClient();
        set({ isLoading: true });
        const { data, error } = await supabase.from('categories').select('*');
        if (error) {
            console.error("Error fetching categories:", error);
            set({ categories: [], isLoading: false });
        } else {
            set({ categories: data, isLoading: false });
        }
    },
    addCategory: async (categoryData) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('categories').insert([categoryData]).select();
        if (error) {
            console.error("Error adding category:", error);
        } else if (data) {
            set((state) => ({ categories: [...state.categories, data[0]] }));
        }
    },
    updateCategory: async (updatedCategory) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('categories').update(updatedCategory).eq('id', updatedCategory.id).select();
        if (error) {
            console.error("Error updating category:", error);
        } else if (data) {
            set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === updatedCategory.id ? data[0] : c
                ),
            }));
        }
    },
    deleteCategory: async (categoryId) => {
        const supabase = createClient();
        const { error } = await supabase.from('categories').delete().eq('id', categoryId);
        if (error) {
            console.error("Error deleting category:", error);
        } else {
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== categoryId),
            }));
        }
    },
}));

export function CategoriesInitializer() {
    const { isInitialized } = useAuth();
    useEffect(() => {
        if (isInitialized) {
            useCategories.getState().fetchCategories();
        }
    }, [isInitialized]);

    return null;
}
