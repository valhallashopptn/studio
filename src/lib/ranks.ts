
'use client';

import { Shield, Award, Crown, Diamond, Gem } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Rank {
    name: string;
    threshold: number;
    icon: LucideIcon;
    color: string; // Tailwind color class
}

export const ranks: Rank[] = [
    { name: 'Bronze', threshold: 0, icon: Shield, color: 'text-orange-400' },
    { name: 'Silver', threshold: 50, icon: Award, color: 'text-gray-400' },
    { name: 'Gold', threshold: 200, icon: Crown, color: 'text-yellow-500' },
    { name: 'Platinum', threshold: 500, icon: Gem, color: 'text-cyan-400' },
    { name: 'Diamond', threshold: 1000, icon: Diamond, color: 'text-violet-400' },
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
