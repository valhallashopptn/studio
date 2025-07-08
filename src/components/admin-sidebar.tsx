

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, Settings, Flame, Paintbrush, Shapes, Boxes, ClipboardList, MessageSquare } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import Image from 'next/image';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Shapes },
  { href: '/admin/stock', label: 'Stock', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/live-chat', label: 'Live Chat', icon: MessageSquare },
  { href: '/admin/settings', label: 'Payments', icon: Settings },
  { href: '/admin/appearance', label: 'Appearance', icon: Paintbrush },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logoUrl } = useSiteSettings();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="flex items-center gap-2 mb-8">
        {logoUrl ? (
          <Image src={logoUrl} alt="Logo" width={32} height={32} className="rounded-sm" unoptimized={logoUrl.startsWith('data:image')} />
        ) : (
          <Flame className="h-6 w-6 text-primary" />
        )}
        <h2 className="text-xl font-bold font-headline">Admin Panel</h2>
      </div>
      <nav className="flex flex-col gap-2">
        {adminNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
              pathname === link.href && 'bg-primary/10 text-primary'
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
