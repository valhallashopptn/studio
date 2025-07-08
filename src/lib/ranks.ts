
'use client';

import { Shield, ShieldCheck, Gem, Crown, Star, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Rank {
    name: string;
    threshold: number;
    icon: LucideIcon;
    color: string; // Tailwind color class
}

export const ranks: Rank[] = [
    { name: 'E-Rank', threshold: 0, icon: Shield, color: 'text-gray-400' },
    { name: 'D-Rank', threshold: 25, icon: ShieldCheck, color: 'text-green-400' },
    { name: 'C-Rank', threshold: 100, icon: Gem, color: 'text-blue-400' },
    { name: 'B-Rank', threshold: 250, icon: Crown, color: 'text-purple-400' },
    { name: 'A-Rank', threshold: 500, icon: Star, color: 'text-red-400' },
    { name: 'S-Rank', threshold: 1000, icon: Flame, color: 'text-violet-500' },
    { name: 'Monarch', threshold: 2500, icon: Flame, color: 'text-amber-400' },
];

export const getRank = (totalSpent: number): Rank => {
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (totalSpent >= rank.threshold) {
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
