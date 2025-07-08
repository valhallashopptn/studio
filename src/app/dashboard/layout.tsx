
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // This effect runs on the client after hydration
    if (!isAuthenticated) {
      router.push('/login');
    } else if(isAdmin) {
      router.push('/admin');
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isVerified) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex flex-1">
            <DashboardSidebar />
            <main className="flex-1 p-8 bg-secondary/50">
                {children}
            </main>
        </div>
    </div>
  );
}
