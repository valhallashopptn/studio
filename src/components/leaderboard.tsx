
'use client';

import { users } from "@/lib/data";
import { getRank } from "@/lib/ranks";
import { useCurrency } from "@/hooks/use-currency";
import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";

export function Leaderboard() {
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const topUsers = useMemo(() => {
        return users
            .filter(u => !u.isAdmin)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
    }, []);

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
                            <TableHead className="w-[20px] px-2">{t('leaderboard.headerRank')}</TableHead>
                            <TableHead>{t('leaderboard.headerHunter')}</TableHead>
                            <TableHead>{t('leaderboard.headerClass')}</TableHead>
                            <TableHead className="text-right">{t('leaderboard.headerSpent')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topUsers.map((user, index) => {
                            const rank = getRank(user.totalSpent);
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-bold px-2">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn("flex items-center gap-1.5 text-xs font-semibold", rank.color)}>
                                            <rank.icon className="h-4 w-4" />
                                            <span>{rank.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {isMounted ? formatPrice(user.totalSpent) : <Skeleton className="h-5 w-20 ml-auto" />}
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
