
'use client';

import { ShieldOff, Shield, ShieldCheck, Sword, Swords, Gem, Diamond, Trophy, Crown, Hexagon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const USD_TO_XP_RATE = 100;
export const USD_TO_VALHALLA_COIN_RATE = 10;
export const VALHALLA_COIN_USD_VALUE = 1 / 500; // 500 coins = $1

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
    { name: 'C-Rank', threshold: 25.6 * USD_TO_XP_RATE, icon: Sword, color: 'text-blue-500' },
    { name: 'B-Rank', threshold: 40.96 * USD_TO_XP_RATE, icon: Swords, color: 'text-violet-500' },
    { name: 'A-Rank', threshold: 65.536 * USD_TO_XP_RATE, icon: Gem, color: 'text-rose-500' },
    { name: 'S-Rank', threshold: 104.8576 * USD_TO_XP_RATE, icon: Diamond, color: 'text-red-500' },
    { name: 'SS-Rank', threshold: 167.77216 * USD_TO_XP_RATE, icon: Trophy, color: 'text-amber-400' },
    { name: 'Legend', threshold: 268.435456 * USD_TO_XP_RATE, icon: Crown, color: 'text-fuchsia-400' },
    { name: 'LORD', threshold: 429.4967296 * USD_TO_XP_RATE, icon: Hexagon, color: 'animate-rgb-cycle', iconColor: 'animate-rgb-cycle', isAnimated: true },
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
