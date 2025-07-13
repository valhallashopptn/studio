
'use client';

import { create } from 'zustand';
import type { StockItem } from '@/lib/types';
import { createClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

type StockState = {
  stock: StockItem[];
  isLoading: boolean;
  fetchStock: () => Promise<void>;
  addStockItems: (productId: string, newData: string[]) => Promise<void>;
  deleteStockItem: (stockItemId: string) => Promise<void>;
  getStockForProduct: (productId: string) => StockItem[];
  getAvailableStockCount: (productId: string) => number;
  deliverStockForOrder: (productId: string, quantity: number) => Promise<string[]>;
};

export const useStock = create<StockState>((set, get) => ({
      stock: [],
      isLoading: true,
      fetchStock: async () => {
        const supabase = createClient();
        set({ isLoading: true });
        const { data, error } = await supabase.from('stock').select('*');
        if (error) {
            console.error("Error fetching stock:", error);
            set({ stock: [], isLoading: false });
        } else {
            set({ stock: data, isLoading: false });
        }
      },
      addStockItems: async (productId, newData) => {
        const supabase = createClient();
        const newItems = newData
            .filter(data => data.trim() !== '')
            .map(data => ({
                productId,
                data: data.trim(),
            }));
        
        if (newItems.length === 0) return;

        const { data, error } = await supabase.from('stock').insert(newItems).select();
        if (error) {
            console.error("Error adding stock items:", error);
        } else if (data) {
            set((state) => ({ stock: [...state.stock, ...data] }));
        }
      },
      deleteStockItem: async (stockItemId) => {
        const supabase = createClient();
        const { error } = await supabase.from('stock').delete().eq('id', stockItemId);
        if (error) {
            console.error("Error deleting stock item:", error);
        } else {
            set((state) => ({
                stock: state.stock.filter(item => item.id !== stockItemId)
            }));
        }
      },
      getStockForProduct: (productId) => {
        return get().stock.filter(item => item.productId === productId);
      },
      getAvailableStockCount: (productId) => {
          return get().stock.filter(item => item.productId === productId && !item.isUsed).length;
      },
      deliverStockForOrder: async (productId, quantity) => {
        const allStock = get().stock;
        const availableStock = allStock.filter(item => item.productId === productId && !item.isUsed);
        
        if (availableStock.length < quantity) {
            console.warn(`Not enough stock for product ${productId}. Required: ${quantity}, Available: ${availableStock.length}`);
        }

        const itemsToDeliver = availableStock.slice(0, quantity);
        if (itemsToDeliver.length === 0) return [];

        const deliveredData = itemsToDeliver.map(item => item.data);
        const deliveredItemIds = itemsToDeliver.map(item => item.id);
        
        const supabase = createClient();
        const { error } = await supabase
            .from('stock')
            .update({ isUsed: true, usedAt: new Date().toISOString() })
            .in('id', deliveredItemIds);
        
        if (error) {
            console.error("Error marking stock as used:", error);
            return []; // Return empty array on failure
        }
        
        // Update local state optimistically
        set(state => ({
            stock: state.stock.map(item =>
                deliveredItemIds.includes(item.id) ? { ...item, isUsed: true, usedAt: new Date().toISOString() } : item
            )
        }));
        
        return deliveredData;
      },
}));

export function StockInitializer() {
    const { isAdmin } = useAuth();
    useEffect(() => {
        // Only fetch stock if user is an admin
        if (isAdmin) {
            useStock.getState().fetchStock();
        }
    }, [isAdmin]);
    
    return null;
}
