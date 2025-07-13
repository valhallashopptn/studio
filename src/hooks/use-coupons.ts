
'use client';

import { create } from 'zustand';
import type { Coupon } from '@/lib/types';
import { useOrders } from './use-orders';
import { useAuth } from './use-auth';
import { createClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';

type CouponsState = {
  coupons: Coupon[];
  isLoading: boolean;
  fetchCoupons: () => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'timesUsed'>) => Promise<string | null>;
  deleteCoupon: (couponId: string) => Promise<void>;
  validateCoupon: (code: string) => Promise<{ isValid: boolean; error?: string; coupon?: Coupon }>;
  applyCoupon: (code: string) => Promise<void>;
};

export const useCoupons = create<CouponsState>((set, get) => ({
      coupons: [],
      isLoading: true,
      fetchCoupons: async () => {
        const supabase = createClient();
        set({ isLoading: true });
        const { data, error } = await supabase.from('coupons').select('*');
        if (error) {
            console.error("Error fetching coupons:", error);
            set({ coupons: [], isLoading: false });
        } else {
            set({ coupons: data, isLoading: false });
        }
      },
      addCoupon: async (couponData) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('coupons').insert([{ ...couponData, timesUsed: 0 }]).select();
        if (error) {
            console.error("Error adding coupon:", error);
            return null;
        } else if (data) {
            set((state) => ({ coupons: [...state.coupons, data[0]] }));
            return data[0].code;
        }
        return null;
      },
      deleteCoupon: async (couponId) => {
        const supabase = createClient();
        const { error } = await supabase.from('coupons').delete().eq('id', couponId);
         if (error) {
            console.error("Error deleting coupon:", error);
        } else {
            set((state) => ({
                coupons: state.coupons.filter(c => c.id !== couponId)
            }));
        }
      },
      validateCoupon: async (code) => {
        // Since coupons are public, we can just check the local state
        const coupon = get().coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

        if (!coupon) {
            return { isValid: false, error: 'Coupon not found.' };
        }
        if (coupon.timesUsed >= coupon.usageLimit) {
            return { isValid: false, error: 'This coupon has reached its usage limit.' };
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return { isValid: false, error: 'This coupon has expired.' };
        }
        if (coupon.firstPurchaseOnly) {
            const { user } = useAuth.getState();
            if (!user) {
                return { isValid: false, error: 'You must be logged in to use this coupon.' };
            }
            // This is a simplification. A real implementation would query the orders table.
            const { orders } = useOrders.getState();
            const isFirstPurchase = !orders.some(o => o.customer.id === user.id);
            if (!isFirstPurchase) {
              return { isValid: false, error: 'This coupon is for first-time customers only.'};
            }
        }

        return { isValid: true, coupon };
      },
      applyCoupon: async (code) => {
        const coupon = get().coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (!coupon) return;
        
        const supabase = createClient();
        const { error } = await supabase.from('coupons').update({ timesUsed: coupon.timesUsed + 1 }).eq('id', coupon.id);
        
        if (error) {
            console.error("Error applying coupon:", error);
        } else {
            set((state) => ({
                coupons: state.coupons.map(c => 
                    c.id === coupon.id
                    ? { ...c, timesUsed: c.timesUsed + 1 }
                    : c
                )
            }));
        }
      }
}));

export function CouponsInitializer() {
    const { isInitialized } = useAuth();
    useEffect(() => {
        if (isInitialized) {
            useCoupons.getState().fetchCoupons();
        }
    }, [isInitialized]);
    
    return null;
}
