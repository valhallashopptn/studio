
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StockItem } from '@/lib/types';
import { stock as initialStock } from '@/lib/data';

type StockState = {
  stock: StockItem[];
  addStockItems: (productId: string, newData: string[]) => void;
  getStockForProduct: (productId: string) => StockItem[];
  getAvailableStockCount: (productId: string) => number;
  deliverStockForOrder: (productId: string, quantity: number) => string[];
};

export const useStock = create(
  persist<StockState>(
    (set, get) => ({
      stock: initialStock,
      addStockItems: (productId, newData) =>
        set((state) => {
          const newItems: StockItem[] = newData
            .filter(data => data.trim() !== '')
            .map(data => ({
                id: `stk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                productId,
                data: data.trim(),
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
            const deliveredData = itemsToDeliver.map(item => item.data);
            const deliveredItemIds = new Set(itemsToDeliver.map(item => item.id));

            set(state => ({
                stock: state.stock.map(item =>
                    deliveredItemIds.has(item.id) ? { ...item, isUsed: true, usedAt: new Date().toISOString() } : item
                )
            }));
            
            return deliveredData;
        }

        const itemsToDeliver = availableStock.slice(0, quantity);
        const deliveredData = itemsToDeliver.map(item => item.data);
        const deliveredItemIds = new Set(itemsToDeliver.map(item => item.id));

        set(state => ({
            stock: state.stock.map(item =>
                deliveredItemIds.has(item.id) ? { ...item, isUsed: true, usedAt: new Date().toISOString() } : item
            )
        }));
        
        return deliveredData;
      },
    }),
    {
      name: 'topup-hub-stock',
    }
  )
);
