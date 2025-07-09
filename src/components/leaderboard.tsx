
'use client';

import { useUserDatabase } from "@/hooks/use-user-database";
import { getRank, formatXp, USD_TO_XP_RATE } from "@/lib/ranks";
import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, ArrowRight, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";

export function Leaderboard() {
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const { users } = useUserDatabase();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const topUsers = useMemo(() => {
        return users
            .filter(u => !u.isAdmin)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
    }, [users]);

    return (
        <Card className="w-full h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Crown className="h-6 w-6 text-amber-400" />
                    {t('leaderboard.title')}
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                    <Link href="/leaderboard">
                        {t('leaderboard.viewAll')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-0">
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
                        {topUsers.map((user, index) => {
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
    )
}
