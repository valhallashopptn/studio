
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, UserCog, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useCurrency } from '@/hooks/use-currency';

const navLinks = [
  { href: '/dashboard/orders', label: 'My Orders', icon: ClipboardList },
  { href: '/dashboard/settings', label: 'Settings', icon: UserCog },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">Customer</p>
        </div>
      </div>
      <div className="mb-8 p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Wallet className="h-5 w-5 text-primary"/>
            <span>Wallet Balance</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(user?.walletBalance ?? 0)}</p>
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
              (pathname === link.href || (link.href === '/dashboard/orders' && pathname === '/dashboard')) && 'bg-primary/10 text-primary'
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
