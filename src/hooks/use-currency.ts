
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'TND';

// A mock conversion rate
const CONVERSION_RATES = {
  USD: 1,
  TND: 3.1,
};

type CurrencyState = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUsd: number) => string;
};

export const useCurrency = create(
  persist<CurrencyState>(
    (set, get) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
      formatPrice: (priceInUsd) => {
        const { currency } = get();
        const rate = CONVERSION_RATES[currency];
        const convertedPrice = priceInUsd * rate;

        if (currency === 'TND') {
          return `${convertedPrice.toFixed(2)} TND`;
        }
        return `$${convertedPrice.toFixed(2)}`;
      },
    }),
    {
      name: 'topup-hub-currency',
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);
