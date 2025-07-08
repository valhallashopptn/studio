
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/lib/types';

type CartState = {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomFieldValue: (itemId: string, fieldName: string, value: string) => void;
  clearCart: () => void;
};

export const useCart = create(
  persist<CartState>(
    (set) => ({
      items: [],
      addItem: (product, variant, quantity = 1) =>
        set((state) => {
          const compositeId = `${product.id}-${variant.id}`;
          const existingItem = state.items.find((item) => item.id === compositeId);

          if (existingItem) {
            const updatedItems = state.items.map((item) =>
              item.id === compositeId ? { ...item, quantity: item.quantity + quantity } : item
            );
            return { items: updatedItems };
          } else {
            const newItem: CartItem = {
              id: compositeId,
              productId: product.id,
              name: product.name,
              image: product.image,
              category: product.category,
              variant,
              quantity,
              customFieldValues: {},
            };
            return { items: [...state.items, newItem] };
          }
        }),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      updateQuantity: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          };
        }),
      updateCustomFieldValue: (itemId, fieldName, value) => 
        set((state) => ({
            items: state.items.map((item) =>
                item.id === itemId
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
