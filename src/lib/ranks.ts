
'use client';

import { ShieldOff, Shield, ShieldCheck, Sword, Swords, Gem, Diamond, Trophy, Crown, Hexagon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const USD_TO_XP_RATE = 1000;
export const USD_TO_VALHALLA_COIN_RATE = 10;
export const VALHALLA_COIN_USD_VALUE = 1 / 300; // 300 coins = $1

export interface Rank {
    name: string;
    threshold: number; // This is now in XP
    icon: LucideIcon;
    color: string; // Tailwind color class for text
    iconColor?: string; // Specific color for the icon, defaults to `color`
    isAnimated?: boolean;
}

export const ranks: Rank[] = [
    { name: 'F-Rank', threshold: 0 * USD_TO_XP_RATE, icon: ShieldOff, color: 'text-slate-400' },
    { name: 'E-Rank', threshold: 10 * USD_TO_XP_RATE, icon: Shield, color: 'text-green-500' },
    { name: 'D-Rank', threshold: 16 * USD_TO_XP_RATE, icon: ShieldCheck, color: 'text-cyan-500' },
    { name: 'C-Rank', threshold: 26 * USD_TO_XP_RATE, icon: Sword, color: 'text-blue-500' },
    { name: 'B-Rank', threshold: 42 * USD_TO_XP_RATE, icon: Swords, color: 'text-violet-500' },
    { name: 'A-Rank', threshold: 67 * USD_TO_XP_RATE, icon: Gem, color: 'text-rose-500' },
    { name: 'S-Rank', threshold: 107 * USD_TO_XP_RATE, icon: Diamond, color: 'text-red-500' },
    { name: 'SS-Rank', threshold: 171 * USD_TO_XP_RATE, icon: Trophy, color: 'text-amber-400' },
    { name: 'Legend', threshold: 274 * USD_TO_XP_RATE, icon: Crown, color: 'text-fuchsia-400' },
    { name: 'LORD', threshold: 438 * USD_TO_XP_RATE, icon: Hexagon, color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent animate-bg-pan', iconColor: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent animate-bg-pan', isAnimated: true },
];

export const getRank = (totalSpent: number): Rank => {
    const totalXp = totalSpent * USD_TO_XP_RATE;
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (totalXp >= rank.threshold) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
};

export const getNextRank = (totalSpent: number): Rank | null => {
    const currentRank = getRank(totalSpent);
    const currentRankIndex = ranks.findIndex(r => r.name === currentRank.name);
    if (currentRankIndex === -1 || currentRankIndex === ranks.length - 1) {
        return null;
    }
    return ranks[currentRankIndex + 1];
}

export const formatXp = (xp: number) => {
    return `${new Intl.NumberFormat('en-US').format(Math.floor(xp))} XP`;
};

export const formatCoins = (coins: number) => {
  return new Intl.NumberFormat('en-US').format(Math.floor(coins));
};
