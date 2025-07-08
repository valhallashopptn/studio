
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StockItem } from '@/lib/types';
import { stock as initialStock } from '@/lib/data';

type StockState = {
  stock: StockItem[];
  addStockItems: (productId: string, newCodes: string[]) => void;
  getStockForProduct: (productId: string) => StockItem[];
  getAvailableStockCount: (productId: string) => number;
};

export const useStock = create(
  persist<StockState>(
    (set, get) => ({
      stock: initialStock,
      addStockItems: (productId, newCodes) =>
        set((state) => {
          const newItems: StockItem[] = newCodes
            .filter(code => code.trim() !== '')
            .map(code => ({
                id: `stk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                productId,
                code: code.trim(),
                isUsed: false,
                addedAt: new Date().toISOString(),
            }));
          
          return { stock: [...state.stock, ...newItems] };
        }),
      getStockForProduct: (productId) => {
        return get().stock.filter(item => item.productId === productId);
      },
      getAvailableStockCount: (productId) => {
          return get().stock.filter(item => item.productId === productId && !item.isUsed).length;
      }
    }),
    {
      name: 'topup-hub-stock',
    }
  )
);
