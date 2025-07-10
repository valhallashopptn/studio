
'use client';

import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { getRank, getNextRank, ranks as allRanks, USD_TO_XP_RATE, formatXp } from '@/lib/ranks';
import { Progress } from '@/components/ui/progress';
import { useCurrency, CONVERSION_RATES } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { Info, Trophy, Palette, Lock, Gem, CheckCircle, XCircle, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserDatabase } from '@/hooks/use-user-database';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Invalid email address.'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
});

const nameStyles = [
  { id: 'default', label: 'Default', className: '' },
  { id: 'rgb', label: 'RGB Flow', className: 'font-bold bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-bg-pan' },
  { id: 'gold', label: 'Golden', className: 'font-bold text-yellow-500' },
  { id: 'frost', label: 'Frost', className: 'font-bold text-cyan-400' },
];

export default function SettingsPage() {
    const { user, updateUser, changePassword, updateAvatar, updateNameStyle, isPremium, subscribeToPremium, cancelSubscription, updateWalletBalance, updateTotalSpent } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const { users: allUsers } = useUserDatabase();
    const [isMounted, setIsMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const leaderboardRank = useMemo(() => {
        if (!user) return null;
        const sortedUsers = [...allUsers]
            .filter(u => !u.isAdmin)
            .sort((a, b) => b.totalSpent - a.totalSpent);
        const userIndex = sortedUsers.findIndex(u => u.id === user.id);
        return userIndex !== -1 ? userIndex + 1 : null;
    }, [allUsers, user]);
    
    const totalXp = user ? user.totalSpent * USD_TO_XP_RATE : 0;
    const rank = user ? getRank(user.totalSpent) : null;
    const nextRank = user ? getNextRank(user.totalSpent) : null;

    const currentRankThreshold = rank?.threshold ?? 0;
    const nextRankThreshold = nextRank?.threshold ?? 0;
    const progressToNextRank = totalXp - currentRankThreshold;
    const requiredForNextRank = nextRankThreshold - currentRankThreshold;
    const progressPercentage = requiredForNextRank > 0 ? (progressToNextRank / requiredForNextRank) * 100 : (nextRank ? 0 : 100);
    const amountToNextRank = nextRank ? nextRank.threshold - totalXp : 0;
    const selectedNameStyle = nameStyles.find(s => s.id === user?.nameStyle)?.className || '';

    const premiumPriceUSD = 10 / CONVERSION_RATES.TND;
    const canResubscribe = user && user.walletBalance >= premiumPriceUSD;

    const handleCancel = () => {
      if (user) {
        cancelSubscription(user.id);
        toast({ title: t('dashboardSettings.cancelToastTitle'), description: t('dashboardSettings.cancelToastDesc') });
      }
    }
    
    const handleResubscribe = () => {
      if (user && canResubscribe) {
        updateWalletBalance(user.id, -premiumPriceUSD);
        updateTotalSpent(user.id, premiumPriceUSD);
        subscribeToPremium(user.id);
        toast({ title: t('dashboardSettings.resubscribeToastTitle'), description: t('dashboardSettings.resubscribeToastDesc') });
      }
    }

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
        if (!user) return;
        updateUser(user.id, values);
        toast({ title: t('dashboardSettings.profileUpdatedToast'), description: t('dashboardSettings.profileUpdatedToastDesc') });
    };

    const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
        if (!user) return;
        // In a real app, you'd verify the current password against a backend.
        if (user.password !== values.currentPassword) {
            passwordForm.setError('currentPassword', { message: 'Incorrect current password.' });
            return;
        }
        changePassword(user.id, values.newPassword);
        toast({ title: t('dashboardSettings.passwordChangedToast'), description: t('dashboardSettings.passwordChangedToastDesc') });
        passwordForm.reset();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            if (!isPremium && file.type === 'image/gif') {
                toast({
                    variant: 'destructive',
                    title: t('premiumPage.featureLockedTitle'),
                    description: t('premiumPage.gifAvatarLockedDesc'),
                });
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    updateAvatar(user.id, reader.result);
                    toast({ title: t('dashboardSettings.avatarUpdatedToast') });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleNameStyleChange = (styleId: string) => {
        if (user) {
            updateNameStyle(user.id, styleId);
            toast({ title: 'Username style updated!' });
        }
    };

    const isLightMode = theme === 'classic-light';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">{t('dashboardSettings.title')}</h1>
                <p className="text-muted-foreground">{t('dashboardSettings.subtitle')}</p>
            </div>
            
            {isPremium && (
                <Alert className="border-yellow-500 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400">
                    <Trophy className="h-4 w-4 !text-yellow-500" />
                    <AlertTitle className="font-bold">Premium Member</AlertTitle>
                    <AlertDescription>
                        You have a 1.5x XP boost and other perks active. Thank you for your support!
                    </AlertDescription>
                </Alert>
            )}

            {rank && (
                <Card>
                    <CardHeader>
                        <Dialog>
                            <div className="flex justify-between items-center">
                                <CardTitle>Your Rank & Progress</CardTitle>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Info className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                    </Button>
                                </DialogTrigger>
                            </div>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>All Available Ranks</DialogTitle>
                                    <DialogDescription>
                                        {t('dashboardSettings.allRanksDescription')}
                                    </DialogDescription>
                                </DialogHeader>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Rank</TableHead>
                                            <TableHead className="text-right">XP Required</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allRanks.map((r) => (
                                            <TableRow key={r.name}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 font-semibold text-base">
                                                        <r.icon className={cn("h-5 w-5", r.iconColor || r.color)} />
                                                        <span className={r.color}>{r.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {isMounted ? formatXp(r.threshold) : <Skeleton className="h-5 w-20 ml-auto" />}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Alert variant="default" className="mt-4">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('dashboardSettings.rankResetNote')}
                                    </AlertDescription>
                                </Alert>
                            </DialogContent>
                        </Dialog>
                        <CardDescription>Track your journey through the ranks. Higher ranks may unlock future benefits!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-4 p-4 bg-secondary rounded-lg">
                            <div className="flex items-center gap-4">
                                <rank.icon className={cn("h-12 w-12", rank.iconColor || rank.color)} />
                                <div>
                                    <h3 className={cn("text-2xl font-bold", rank.color)}>
                                        {rank.name}
                                    </h3>
                                    {isMounted ? (
                                        <p className="text-muted-foreground">Total XP: {formatXp(totalXp)}</p>
                                    ) : (
                                        <Skeleton className="h-5 w-32 mt-1" />
                                    )}
                                </div>
                            </div>
                             {isMounted && leaderboardRank ? (
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 justify-end">
                                        <Trophy className="h-4 w-4 text-amber-400" />
                                        <span>{t('dashboardSettings.globalRank')}</span>
                                    </p>
                                    <p className="text-2xl font-bold">#{leaderboardRank}</p>
                                </div>
                            ) : isMounted ? null : (
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20 ml-auto" />
                                    <Skeleton className="h-8 w-12 ml-auto" />
                                </div>
                            )}
                        </div>
                        {nextRank ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Progress to {nextRank.name}</span>
                                    {isMounted ? (
                                        <span>{formatXp(totalXp)} / {formatXp(nextRank.threshold)}</span>
                                    ) : (
                                        <Skeleton className="h-5 w-32" />
                                    )}
                                </div>
                                <Progress value={progressPercentage} className="w-full" />
                                <div className="text-sm text-center text-muted-foreground pt-1 h-5">
                                    {isMounted ? (
                                        <p>
                                            Earn <span className="font-bold text-primary">{formatXp(amountToNextRank)}</span> more to rank up.
                                        </p>
                                    ) : (
                                        <Skeleton className="h-5 w-48 mx-auto" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center font-semibold text-primary p-2 bg-secondary rounded-md">{t('dashboardSettings.maxRankText')}</div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
                    <CardDescription>
                        Choose your preferred site theme.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant={!isLightMode ? 'default' : 'outline'}
                            onClick={() => setTheme('violet-fusion')}
                            className="h-20"
                        >
                            <Moon className="mr-2 h-5 w-5" />
                            <div>
                                <p className="font-semibold">Dark Mode</p>
                                <p className="text-xs font-normal">Recommended</p>
                            </div>
                        </Button>
                        <Button
                            variant={isLightMode ? 'default' : 'outline'}
                            onClick={() => setTheme('classic-light')}
                             className="h-20"
                        >
                            <Sun className="mr-2 h-5 w-5" />
                            <div>
                                <p className="font-semibold">Light Mode</p>
                                <p className="text-xs font-normal">Classic View</p>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Profile Customization</CardTitle>
                    <CardDescription>
                        {isPremium
                            ? "As a premium member, you can customize your profile's appearance."
                            : "Unlock profile customization perks by upgrading to Premium."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="relative">
                        {!isPremium && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg -m-6 p-6">
                                <div className="text-center">
                                    <Lock className="h-10 w-10 text-muted-foreground mb-3 mx-auto" />
                                    <h3 className="text-lg font-semibold">This is a Premium Feature</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Unlock animated names and more.</p>
                                    <Button asChild>
                                        <Link href="/premium">
                                            <Gem className="mr-2 h-4 w-4" />
                                            Unlock with Premium
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div>
                            <Label className="text-base font-semibold">Username Style</Label>
                            <p className="text-sm text-muted-foreground mb-4">Choose how your name appears across the site.</p>
                            <RadioGroup
                                defaultValue={user?.nameStyle || 'default'}
                                onValueChange={handleNameStyleChange}
                                className="grid sm:grid-cols-2 gap-4"
                                disabled={!isPremium}
                            >
                                {nameStyles.map(style => (
                                <Label
                                    key={style.id}
                                    htmlFor={`style-${style.id}`}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg border p-4",
                                        isPremium ? "cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-secondary" : "cursor-not-allowed"
                                    )}
                                >
                                    <span className={cn('font-semibold', style.className)}>{style.label}</span>
                                    <RadioGroupItem value={style.id} id={`style-${style.id}`} />
                                </Label>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.profilePicture')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.profilePictureDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.avatar} asChild>
                                <Image src={user?.avatar || ''} alt={user?.name || ''} width={80} height={80} unoptimized={isPremium && user?.avatar?.endsWith('.gif')} />
                            </AvatarImage>
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">{t('dashboardSettings.uploadNewPicture')}</Label>
                            <Input id="picture" type="file" accept={isPremium ? "image/gif, image/png, image/jpeg" : "image/png, image/jpeg"} onChange={handleAvatarChange} className="file:text-primary file:font-semibold" />
                             {isPremium ? (
                                <p className="text-xs text-muted-foreground">Premium perk: Animated GIFs are supported!</p>
                             ) : (
                                <p className="text-xs text-muted-foreground">
                                    <Link href="/premium" className="underline text-primary font-semibold hover:text-primary/80 flex items-center gap-1 w-fit">
                                        <Lock className="h-3 w-3" />
                                        Unlock animated GIF avatars with Premium.
                                    </Link>
                                </p>
                             )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.manageSubTitle')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.manageSubDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {user?.premium ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Label>{t('dashboardSettings.statusLabel')}:</Label>
                            <p className={cn("font-semibold flex items-center gap-1.5", isPremium ? 'text-green-500' : 'text-muted-foreground')}>
                                {isPremium ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                                {isPremium ? t('dashboardSettings.activeStatus') : (user.premium.status === 'cancelled' ? t('dashboardSettings.cancelledStatus') : t('dashboardSettings.expiredStatus'))}
                            </p>
                        </div>
                        <div>
                            <Label>{user.premium.status === 'active' ? t('dashboardSettings.renewsOnLabel') : t('dashboardSettings.expiresOnLabel')}</Label>
                            <p className="font-semibold">{format(new Date(user.premium.expiresAt), 'PPP')}</p>
                        </div>

                        {user.premium.status === 'active' && (
                            <Button variant="destructive" onClick={handleCancel}>{t('dashboardSettings.cancelSubButton')}</Button>
                        )}

                        {!isPremium && (
                        <div className="pt-2 border-t mt-4">
                            <p className="text-sm text-muted-foreground mb-2">{t('dashboardSettings.resubscribePrompt')}</p>
                            <Button onClick={handleResubscribe} disabled={!canResubscribe}>
                                {t('dashboardSettings.resubscribeButton', { price: formatPrice(premiumPriceUSD) })}
                            </Button>
                            {!canResubscribe && <p className="text-xs text-destructive mt-1">{t('dashboardSettings.insufficientFunds')}</p>}
                        </div>
                        )}
                    </div>
                    ) : (
                    <div>
                        <p className="text-muted-foreground">{t('dashboardSettings.noSubscription')}</p>
                        <Button asChild className="mt-2"><Link href="/premium">{t('dashboardSettings.goPremiumButton')}</Link></Button>
                    </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.personalInfo')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.personalInfoDesc')}</CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={profileForm.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('dashboardSettings.name')}</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    {isPremium && (
                                        <div className="text-sm text-muted-foreground pt-2">
                                            Preview: <span className={cn("font-bold", selectedNameStyle)}>{field.value || 'Your Name'}</span>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={profileForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.email')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">{t('dashboardSettings.saveChanges')}</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.changePassword')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.changePasswordDesc')}</CardDescription>
                </CardHeader>
                 <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.currentPassword')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.newPassword')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.confirmNewPassword')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">{t('dashboardSettings.updatePassword')}</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
