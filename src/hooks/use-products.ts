
'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/types';
import { createClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

type ProductsState = {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
};

export const useProducts = create<ProductsState>((set) => ({
  products: [],
  isLoading: true,
  fetchProducts: async () => {
    const supabase = createClient();
    set({ isLoading: true });
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      set({ products: [], isLoading: false });
    } else {
      set({ products: data, isLoading: false });
    }
  },
  addProduct: async (productData) => {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) {
      console.error('Error adding product:', error);
    } else if (data) {
      set((state) => ({ products: [...state.products, data[0]] }));
    }
  },
  updateProduct: async (updatedProduct) => {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id).select();
    if (error) {
      console.error('Error updating product:', error);
    } else if (data) {
      set((state) => ({
        products: state.products.map((p) =>
          p.id === updatedProduct.id ? data[0] : p
        ),
      }));
    }
  },
  deleteProduct: async (productId) => {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product:', error);
    } else {
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
      }));
    }
  },
}));

export function ProductsInitializer() {
    const { isInitialized } = useAuth();
    useEffect(() => {
        if (isInitialized) {
            useProducts.getState().fetchProducts();
        }
    }, [isInitialized]);

    return null;
}
