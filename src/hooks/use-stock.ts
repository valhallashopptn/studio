
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
  deliverStockForOrder: (productId: string, quantity: number) => string[];
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
      },
      deliverStockForOrder: (productId, quantity) => {
        const availableStock = get().stock.filter(item => item.productId === productId && !item.isUsed);
        if (availableStock.length < quantity) {
            console.warn(`Not enough stock for product ${productId}. Required: ${quantity}, Available: ${availableStock.length}`);
            // Deliver what's available
            const itemsToDeliver = availableStock;
            const deliveredCodes = itemsToDeliver.map(item => item.code);
            const deliveredItemIds = new Set(itemsToDeliver.map(item => item.id));

            set(state => ({
                stock: state.stock.map(item =>
                    deliveredItemIds.has(item.id) ? { ...item, isUsed: true, usedAt: new Date().toISOString() } : item
                )
            }));
            
            return deliveredCodes;
        }

        const itemsToDeliver = availableStock.slice(0, quantity);
        const deliveredCodes = itemsToDeliver.map(item => item.code);
        const deliveredItemIds = new Set(itemsToDeliver.map(item => item.id));

        set(state => ({
            stock: state.stock.map(item =>
                deliveredItemIds.has(item.id) ? { ...item, isUsed: true, usedAt: new Date().toISOString() } : item
            )
        }));
        
        return deliveredCodes;
      },
    }),
    {
      name: 'topup-hub-stock',
    }
  )
);
