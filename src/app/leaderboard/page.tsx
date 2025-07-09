
"use client";

import { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { useTranslation } from "@/hooks/use-translation";
import { useUserDatabase } from "@/hooks/use-user-database";
import { getRank, formatXp, USD_TO_XP_RATE } from "@/lib/ranks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';

export default function LeaderboardPage() {
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const { users } = useUserDatabase();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const allUsersSorted = useMemo(() => {
        return users
            .filter(u => !u.isAdmin)
            .sort((a, b) => b.totalSpent - a.totalSpent);
    }, [users]);

    const animationClass = (delay: number) => isMounted ? `opacity-0 animate-fade-in-up [animation-fill-mode:forwards] [animation-delay:${delay}ms]` : 'opacity-0';

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1">
                <section className="bg-primary/10 py-16 text-center overflow-hidden">
                    <div className={`container mx-auto px-4 ${animationClass(0)}`}>
                        <h1 className="text-4xl font-bold font-headline text-primary flex items-center justify-center gap-3">
                            <Crown className="h-8 w-8 text-amber-400" />
                            {t('leaderboard.fullTitle')}
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t('leaderboard.fullSubtitle')}
                        </p>
                    </div>
                </section>
                
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('leaderboard.fullCardTitle')}</CardTitle>
                                <CardDescription>{t('leaderboard.fullCardDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px] px-2 text-center">{t('leaderboard.headerRank')}</TableHead>
                                            <TableHead>{t('leaderboard.headerHunter')}</TableHead>
                                            <TableHead>{t('leaderboard.headerClass')}</TableHead>
                                            <TableHead className="text-right">{t('leaderboard.headerSpent')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allUsersSorted.map((user, index) => {
                                            const rank = getRank(user.totalSpent);
                                            const rankPosition = index + 1;
                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-bold px-2 text-center">
                                                        <div className="flex items-baseline justify-center gap-1.5">
                                                            <span className={cn("text-lg", rankPosition === 1 && "text-yellow-500")}>{rankPosition}</span>
                                                            {rankPosition === 1 && <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                                                            {rankPosition === 2 && <Medal className="h-5 w-5 text-slate-400" />}
                                                            {rankPosition === 3 && <Medal className="h-5 w-5 text-amber-700" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={user.avatar} />
                                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                             {user.isPremium ? (
                                                                <span className="font-medium bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-bg-pan">{user.name}</span>
                                                            ) : (
                                                                <span className="font-medium">{user.name}</span>
                                                            )}
                                                            {user.isPremium && (
                                                                <Badge variant="outline" className="border-yellow-500 text-yellow-500 animate-pulse font-bold">PREMIUM</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 font-semibold">
                                                            <rank.icon className={cn("h-4 w-4", rank.iconColor || rank.color)} />
                                                            <span className={rank.color}>{rank.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-sm">
                                                        {isMounted ? formatXp(user.totalSpent * USD_TO_XP_RATE) : <Skeleton className="h-5 w-20 ml-auto" />}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <AppFooter />
        </div>
    );
}
