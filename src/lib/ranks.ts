
'use client';

import { ShieldOff, Shield, ShieldCheck, Sword, Swords, Gem, Diamond, Trophy, Crown, Hexagon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const USD_TO_XP_RATE = 1000;

export interface Rank {
    name: string;
    threshold: number; // This is now in XP
    icon: LucideIcon;
    color: string; // Tailwind color class
}

export const ranks: Rank[] = [
    { name: 'F-Rank', threshold: 0 * USD_TO_XP_RATE, icon: ShieldOff, color: 'text-gray-500' },
    { name: 'E-Rank', threshold: 10 * USD_TO_XP_RATE, icon: Shield, color: 'text-orange-400' },
    { name: 'D-Rank', threshold: 50 * USD_TO_XP_RATE, icon: ShieldCheck, color: 'text-lime-500' },
    { name: 'C-Rank', threshold: 150 * USD_TO_XP_RATE, icon: Sword, color: 'text-sky-500' },
    { name: 'B-Rank', threshold: 300 * USD_TO_XP_RATE, icon: Swords, color: 'text-blue-500' },
    { name: 'A-Rank', threshold: 600 * USD_TO_XP_RATE, icon: Gem, color: 'text-purple-500' },
    { name: 'S-Rank', threshold: 1200 * USD_TO_XP_RATE, icon: Diamond, color: 'text-red-500' },
    { name: 'SS-Rank', threshold: 2500 * USD_TO_XP_RATE, icon: Trophy, color: 'text-amber-400' },
    { name: 'Legend', threshold: 5000 * USD_TO_XP_RATE, icon: Crown, color: 'text-yellow-300' },
    { name: 'Lord', threshold: 10000 * USD_TO_XP_RATE, icon: Hexagon, color: 'text-violet-400' },
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
