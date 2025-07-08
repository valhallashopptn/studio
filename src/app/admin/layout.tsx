
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait until the component has mounted to check auth state.
    // By this time, Zustand's store will be rehydrated from localStorage.
    if (isMounted && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, isAdmin, router]);

  // While not mounted, or if mounted but not authenticated as an admin, show a loader.
  // This prevents a flash of content before the logic in useEffect can redirect.
  if (!isMounted || !isAuthenticated || !isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // If mounted and authenticated as an admin, show the content.
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-2 md:p-8 bg-secondary/50 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav links={adminNavLinks} />
    </div>
  );
}
