
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, UserCog, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useCurrency } from '@/hooks/use-currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const navLinks = [
    { href: '/dashboard/orders', label: t('dashboardSidebar.myOrders'), icon: ClipboardList },
    { href: '/dashboard/settings', label: t('dashboardSidebar.settings'), icon: UserCog },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{t('dashboardSidebar.customer')}</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboardSidebar.walletBalance')}</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-primary">{formatPrice(user?.walletBalance ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{t('dashboardSidebar.availableToSpend')}</p>
        </CardContent>
      </Card>

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
