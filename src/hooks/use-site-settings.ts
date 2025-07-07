
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SiteSettingsState = {
  siteTitle: string;
  setSiteTitle: (title: string) => void;
  heroImageUrl: string;
  setHeroImageUrl: (url: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
};

export const useSiteSettings = create(
  persist<SiteSettingsState>(
    (set) => ({
      siteTitle: 'TopUp Hub',
      setSiteTitle: (title: string) => set({ siteTitle: title }),
      heroImageUrl: 'https://placehold.co/1920x1080.png',
      setHeroImageUrl: (url: string) => set({ heroImageUrl: url }),
      logoUrl: '',
      setLogoUrl: (url: string) => set({ logoUrl: url }),
    }),
    {
      name: 'topup-hub-site-settings',
    }
  )
);
