
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Loader2, ClipboardList, UserCog, AlertTriangle } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { MobileNav, type NavLink } from '@/components/mobile-nav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const dashboardNavLinks: NavLink[] = [
  { href: '/dashboard/settings', label: 'Profile', icon: UserCog },
  { href: '/dashboard/orders', label: 'My Orders', icon: ClipboardList },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isAdmin, clearWarning } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait until the component has mounted to check auth state.
    // By this time, Zustand's store will be rehydrated from localStorage.
    if (isMounted) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else if(isAdmin) {
        router.push('/admin');
      } else if (user.isBanned) {
        router.push('/banned');
      }
    }
  }, [isMounted, isAuthenticated, user, isAdmin, router]);
  
  const handleClearWarning = () => {
    if (user) {
      clearWarning(user.id);
    }
  }

  // While not mounted, or if the user is not a regular customer, show a loader.
  // This prevents a flash of content before the logic in useEffect can redirect.
  if (!isMounted || !isAuthenticated || !user || isAdmin || user.isBanned) {
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
                  {user.warningMessage && (
                      <Alert variant="destructive" className="mb-6">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="font-bold">A Message from the Administrators</AlertTitle>
                          <AlertDescription className="flex items-start justify-between">
                            <p className="flex-grow pr-4">{user.warningMessage}</p>
                            <Button variant="outline" size="sm" onClick={handleClearWarning} className="bg-destructive/10 hover:bg-destructive/20 border-destructive/20 hover:border-destructive/30 text-destructive-foreground">
                                Acknowledge
                            </Button>
                          </AlertDescription>
                      </Alert>
                  )}
                  {children}
              </main>
            </div>
        </div>
        <MobileNav links={dashboardNavLinks} />
    </div>
  );
}
