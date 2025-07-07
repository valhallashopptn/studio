
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Locale = 'en' | 'ar';

const translations = { en, ar };

type TranslationState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
};

// Helper function to get nested keys
const getNestedValue = (obj: any, key: string): string => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj) || key;
};

export const useTranslation = create(
  persist<TranslationState>(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      t: (key, params) => {
        const { locale } = get();
        const translationSet = translations[locale];
        let translated = getNestedValue(translationSet, key);

        if (params) {
          Object.keys(params).forEach(paramKey => {
            translated = translated.replace(`{{${paramKey}}}`, String(params[paramKey]));
          });
        }
        
        return translated;
      },
    }),
    {
      name: 'topup-hub-language',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
