
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coupon } from '@/lib/types';
import { useOrders } from './use-orders';
import { useAuth } from './use-auth';

type CouponsState = {
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'timesUsed'>) => string;
  deleteCoupon: (couponId: string) => void;
  validateCoupon: (code: string) => { isValid: boolean; error?: string; coupon?: Coupon };
  applyCoupon: (code: string) => void;
};

const initialCoupons: Coupon[] = [
    {
        id: 'coupon_1',
        code: 'WINTER10',
        discountType: 'percentage',
        value: 10,
        expiresAt: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(), // Jan 1st next year
        usageLimit: 100,
        timesUsed: 5,
        firstPurchaseOnly: false,
    },
    {
        id: 'coupon_2',
        code: '5OFF',
        discountType: 'fixed',
        value: 5,
        usageLimit: 50,
        timesUsed: 10,
        firstPurchaseOnly: false,
    },
    {
        id: 'coupon_3',
        code: 'WELCOME15',
        discountType: 'percentage',
        value: 15,
        usageLimit: 500,
        timesUsed: 0,
        firstPurchaseOnly: true,
    }
];

export const useCoupons = create(
  persist<CouponsState>(
    (set, get) => ({
      coupons: initialCoupons,
      addCoupon: (couponData) => {
        const newCoupon: Coupon = {
            id: `coupon_${Date.now()}`,
            timesUsed: 0,
            firstPurchaseOnly: false,
            ...couponData,
        };
        set((state) => ({ coupons: [...state.coupons, newCoupon] }));
        return newCoupon.code;
      },
      deleteCoupon: (couponId) => {
        set((state) => ({
            coupons: state.coupons.filter(c => c.id !== couponId)
        }));
      },
      validateCoupon: (code) => {
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
            const { orders } = useOrders.getState();
            const isFirstPurchase = !orders.some(o => o.customer.id === user?.id);
            if (!isFirstPurchase) {
              return { isValid: false, error: 'This coupon is for first-time customers only.'};
            }
        }

        return { isValid: true, coupon };
      },
      applyCoupon: (code) => {
        set((state) => ({
            coupons: state.coupons.map(c => 
                c.code.toUpperCase() === code.toUpperCase()
                ? { ...c, timesUsed: c.timesUsed + 1 }
                : c
            )
        }));
      }
    }),
    {
      name: 'topup-hub-coupons',
    }
  )
);
