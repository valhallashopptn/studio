
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Loader2, LayoutDashboard, Package, Settings, Paintbrush, Shapes, Boxes, ClipboardList, MessageSquare } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { MobileNav, type NavLink } from '@/components/mobile-nav';

const adminNavLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/appearance', label: 'Appearance', icon: Paintbrush },
  // These will go into the 'More' sheet
  { href: '/admin/categories', label: 'Categories', icon: Shapes },
  { href: '/admin/stock', label: 'Stock', icon: Boxes },
  { href: '/admin/live-chat', label: 'Live Chat', icon: MessageSquare },
  { href: '/admin/settings', label: 'Payments', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // This effect runs on the client after hydration
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isVerified) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 bg-secondary/50 pb-24 md:pb-8">
          {children}
        </main>
        <MobileNav links={adminNavLinks} />
      </div>
    </div>
  );
}
