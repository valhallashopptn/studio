
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Loader2, ClipboardList, UserCog } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { MobileNav, type NavLink } from '@/components/mobile-nav';

const dashboardNavLinks: NavLink[] = [
  { href: '/dashboard/orders', label: 'My Orders', icon: ClipboardList },
  { href: '/dashboard/settings', label: 'Settings', icon: UserCog },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait until the component has mounted to check auth state.
    // By this time, Zustand's store will be rehydrated from localStorage.
    if (isMounted) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if(isAdmin) {
        router.push('/admin');
      }
    }
  }, [isMounted, isAuthenticated, isAdmin, router]);

  // While not mounted, or if the user is not a regular customer, show a loader.
  // This prevents a flash of content before the logic in useEffect can redirect.
  if (!isMounted || !isAuthenticated || isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // If mounted and this is an authenticated, non-admin user, show the content.
  return (
    <div className="flex h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            <div className="flex-1 overflow-auto">
              <main className="p-2 md:p-8 bg-secondary/50 pb-24 md:pb-8">
                  {children}
              </main>
            </div>
        </div>
        <MobileNav links={dashboardNavLinks} />
    </div>
  );
}
