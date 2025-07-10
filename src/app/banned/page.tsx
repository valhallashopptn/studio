
'use client';

import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldBan, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function BannedPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!user || !user.isBanned) {
        // Redirect non-banned users away
        if (typeof window !== 'undefined') {
            router.push('/');
        }
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg text-center shadow-lg">
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
                            If you believe this is a mistake, please contact our support team.
                        </p>
                        <Button onClick={handleLogout} className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <AppFooter />
        </div>
    );
}
