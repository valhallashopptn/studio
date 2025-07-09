
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, UserCog, Wallet, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useCurrency } from '@/hooks/use-currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { getRank, formatCoins } from '@/lib/ranks';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isPremium } = useAuth();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const rank = user ? getRank(user.totalSpent) : null;


  const navLinks = [
    { href: '/dashboard/settings', label: t('dashboardSidebar.profile'), icon: UserCog },
    { href: '/dashboard/orders', label: t('dashboardSidebar.myOrders'), icon: ClipboardList },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} asChild>
                <Image src={user?.avatar || ''} alt={user?.name || ''} width={48} height={48} unoptimized={isPremium && user?.avatar?.endsWith('.gif')} />
            </AvatarImage>
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <div className="flex items-center gap-2">
              <h2 className={cn(
                  "text-lg font-bold",
                  isPremium && user?.nameStyle === 'rgb' && 'bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-bg-pan',
                  isPremium && user?.nameStyle === 'gold' && 'text-yellow-500',
                  isPremium && user?.nameStyle === 'frost' && 'text-cyan-400',
              )}>
                  {user?.name}
              </h2>
              {isPremium && <Badge variant="outline" className="border-yellow-500 text-yellow-500 animate-pulse font-bold text-xs">PREMIUM</Badge>}
            </div>
            {rank && (
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <rank.icon className={cn("h-4 w-4", rank.iconColor || rank.color)} />
                  <span className={rank.color}>{rank.name}</span>
                </div>
            )}
        </div>
      </div>
      <div className="space-y-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboardSidebar.walletBalance')}</CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold text-primary">{formatPrice(user?.walletBalance ?? 0)}</div>
              <p className="text-xs text-muted-foreground">{t('dashboardSidebar.availableToSpend')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboardSidebar.valhallaCoins')}</CardTitle>
              <Coins className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold text-amber-500">{formatCoins(user?.valhallaCoins ?? 0)}</div>
              <p className="text-xs text-muted-foreground">{t('dashboardSidebar.availableToRedeem')}</p>
          </CardContent>
        </Card>
      </div>

      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
              (pathname.startsWith(link.href)) && 'bg-primary/10 text-primary'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
