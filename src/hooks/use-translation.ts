
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Locale = 'en' | 'ar';

const translations = { en, ar };

// Helper function to get nested keys
const getNestedValue = (obj: any, key: string): string => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj) || key;
};

// The core store only holds the state and state-changing functions
interface LocaleStoreState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const useInternalLocaleStore = create(
  persist<LocaleStoreState>(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'topup-hub-language',
      // Only persist the locale itself
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

// The hook that components will consume. It's hydration-aware.
export const useTranslation = () => {
  const { locale, setLocale } = useInternalLocaleStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Before mounting, we force it to 'en' to match the server render.
  // After mounting, the `locale` from the store will be the hydrated, persisted one.
  const effectiveLocale = isMounted ? locale : 'en';

  const t = (key: string, params?: { [key: string]: string | number }) => {
    // Always use the effective locale for translation
    const translationSet = translations[effectiveLocale];
    let translated = getNestedValue(translationSet, key);

    if (params) {
      Object.keys(params).forEach(paramKey => {
        translated = translated.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    
    return translated;
  };

  return {
    locale: effectiveLocale,
    setLocale,
    t,
  };
};
