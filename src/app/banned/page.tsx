
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldBan, LogOut, Loader2, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import Link from 'next/link';

export default function BannedPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { siteTitle, logoUrl } = useSiteSettings();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && (!user || !user.isBanned)) {
            router.push('/');
        }
    }, [isMounted, user, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };
    
    if (!isMounted || !user || !user.isBanned) {
         return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <header className="absolute top-0 left-0 w-full p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-sm" />
                        ) : (
                          <Flame className="h-6 w-6" />
                        )}
                        <span className="font-semibold">{siteTitle}</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in-up">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
                            <ShieldBan className="h-12 w-12 text-destructive" />
                        </div>
                        <CardTitle className="text-3xl">Account Access Restricted</CardTitle>
                        <CardDescription className="text-lg">Your account has been banned.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.bannedAt && (
                             <p className="text-muted-foreground">
                                Banned on: <span className="font-semibold text-foreground">{format(new Date(user.bannedAt), 'PPP')}</span>
                            </p>
                        )}
                        <div className="p-4 bg-secondary rounded-md text-left">
                           <p className="font-semibold">Reason for ban:</p>
                           <p className="text-muted-foreground">{user.banReason || 'No reason was provided.'}</p>
                        </div>
                        <p className="text-sm text-muted-foreground pt-4">
                            If you believe this is a mistake, please contact our support team through other channels.
                        </p>
                        <Button onClick={handleLogout} className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
