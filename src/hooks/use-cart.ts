
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/lib/types';

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateCustomFieldValue: (productId: string, fieldName: string, value: string) => void;
  clearCart: () => void;
};

export const useCart = create(
  persist<CartState>(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            const updatedItems = state.items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
            return { items: updatedItems };
          } else {
            const newItem: CartItem = { ...product, quantity, customFieldValues: {} };
            return { items: [...state.items, newItem] };
          }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== productId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          };
        }),
      updateCustomFieldValue: (productId, fieldName, value) => 
        set((state) => ({
            items: state.items.map((item) =>
                item.id === productId 
                ? {
                    ...item,
                    customFieldValues: {
                        ...item.customFieldValues,
                        [fieldName]: value,
                    }
                  }
                : item
            ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'topup-hub-cart',
    }
  )
);
