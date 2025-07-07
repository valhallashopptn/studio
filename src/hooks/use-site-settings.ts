'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SiteSettingsState = {
  heroImageUrl: string;
  setHeroImageUrl: (url: string) => void;
};

export const useSiteSettings = create(
  persist<SiteSettingsState>(
    (set) => ({
      heroImageUrl: 'https://placehold.co/1920x1080.png',
      setHeroImageUrl: (url: string) => set({ heroImageUrl: url }),
    }),
    {
      name: 'topup-hub-site-settings',
    }
  )
);
