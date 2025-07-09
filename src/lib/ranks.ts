
'use client';

import { ShieldOff, Shield, ShieldCheck, Sword, Swords, Gem, Diamond, Trophy, Crown, Hexagon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const USD_TO_XP_RATE = 1000;

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
    { name: 'D-Rank', threshold: 17 * USD_TO_XP_RATE, icon: ShieldCheck, color: 'text-cyan-500' },
    { name: 'C-Rank', threshold: 29 * USD_TO_XP_RATE, icon: Sword, color: 'text-blue-500' },
    { name: 'B-Rank', threshold: 49 * USD_TO_XP_RATE, icon: Swords, color: 'text-violet-500' },
    { name: 'A-Rank', threshold: 83 * USD_TO_XP_RATE, icon: Gem, color: 'text-rose-500' },
    { name: 'S-Rank', threshold: 141 * USD_TO_XP_RATE, icon: Diamond, color: 'text-red-500' },
    { name: 'SS-Rank', threshold: 240 * USD_TO_XP_RATE, icon: Trophy, color: 'text-amber-400' },
    { name: 'Legend', threshold: 408 * USD_TO_XP_RATE, icon: Crown, color: 'text-fuchsia-400' },
    { name: 'LORD', threshold: 694 * USD_TO_XP_RATE, icon: Hexagon, color: 'uppercase font-bold bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-bg-pan', iconColor: 'text-fuchsia-400', isAnimated: true },
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
