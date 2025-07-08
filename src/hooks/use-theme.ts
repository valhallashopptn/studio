
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName = 'violet-fusion' | 'cyber-green' | 'solar-flare' | 'classic-light' | 'winter-wonderland';

type ThemeState = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export const useTheme = create(
  persist<ThemeState>(
    (set) => ({
      theme: 'violet-fusion',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'topup-hub-theme',
    }
  )
);
