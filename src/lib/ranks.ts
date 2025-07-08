
'use client';

import { Shield, ShieldCheck, Gem, Crown, Trophy, Diamond, Hexagon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const USD_TO_XP_RATE = 1000;

export interface Rank {
    name: string;
    threshold: number; // This is now in XP
    icon: LucideIcon;
    color: string; // Tailwind color class
}

export const ranks: Rank[] = [
    { name: 'Bronze', threshold: 0 * USD_TO_XP_RATE, icon: Shield, color: 'text-orange-400' },
    { name: 'Silver', threshold: 25 * USD_TO_XP_RATE, icon: ShieldCheck, color: 'text-gray-400' },
    { name: 'Gold', threshold: 100 * USD_TO_XP_RATE, icon: Trophy, color: 'text-amber-400' },
    { name: 'Platinum', threshold: 250 * USD_TO_XP_RATE, icon: Gem, color: 'text-cyan-400' },
    { name: 'Diamond', threshold: 500 * USD_TO_XP_RATE, icon: Diamond, color: 'text-blue-400' },
    { name: 'Vibranium', threshold: 1000 * USD_TO_XP_RATE, icon: Hexagon, color: 'text-violet-500' },
    { name: 'Legend', threshold: 2500 * USD_TO_XP_RATE, icon: Crown, color: 'text-red-500' },
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
