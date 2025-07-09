
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Flame, LogOut, LayoutDashboard, Wallet, Megaphone, Menu, X, Coins, Crown, Trophy, Gem } from 'lucide-react';
import { CartSheet } from '@/components/cart-sheet';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSiteSettings } from '@/hooks/use-site-settings';
import Image from 'next/image';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { CurrencySwitcher } from './currency-switcher';
import { useContentSettings } from '@/hooks/use-content-settings';
import { useCurrency } from '@/hooks/use-currency';
import { useTheme } from '@/hooks/use-theme';
import { Skeleton } from './ui/skeleton';
import { getRank, getNextRank, formatXp, USD_TO_XP_RATE, formatCoins } from '@/lib/ranks';
import { Progress } from './ui/progress';

import { useOrders } from '@/hooks/use-orders';
import { useReviews } from '@/hooks/use-reviews';
import { products } from '@/lib/data';
import type { Order, Product } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReviewForm } from '@/components/review-form';
import { useToast } from '@/hooks/use-toast';
import { useUserDatabase } from '@/hooks/use-user-database';


export function AppHeader() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCart((state) => state.items);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { users: allUsers } = useUserDatabase();
  const { logoUrl, siteTitle } = useSiteSettings();
  const { announcementEnabled, announcementText } = useContentSettings();
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { formatPrice } = useCurrency();
  const { theme } = useTheme();

  // Review Prompt Logic
  const { orders, markOrderAsReviewPrompted } = useOrders();
  const { hasReviewed } = useReviews();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [productsForReview, setProductsForReview] = useState<Product[]>([]);
  const [isReviewPromptOpen, setIsReviewPromptOpen] = useState(false);
  const [ordersToReview, setOrdersToReview] = useState<Order[]>([]);

  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(order => order.customer.id === user.id);
  }, [orders, user]);

  useEffect(() => {
    if (!user || isAdmin || !isMounted) return;
    const unpromptedCompletedOrders = customerOrders.filter(
        order => order.status === 'completed' && !order.reviewPrompted
    );
    
    if (unpromptedCompletedOrders.length > 0) {
        const timer = setTimeout(() => {
            setOrdersToReview(unpromptedCompletedOrders);
            setIsReviewPromptOpen(true);
        }, 3000); // 3-second delay
        
        return () => clearTimeout(timer);
    }
  }, [customerOrders, user, isAdmin, isMounted]);

  const handleReviewPromptClose = () => {
    const orderIds = ordersToReview.map(o => o.id);
    if (orderIds.length > 0) {
        markOrderAsReviewPrompted(orderIds);
    }
    setIsReviewPromptOpen(false);
    setOrdersToReview([]);
  };

  const handleReviewPromptAction = () => {
    if (!user) return;

    const unreviewedProductNames = new Set(
      ordersToReview
        .flatMap(order => order.items)
        .filter(item => !hasReviewed(item.name, user.name))
        .map(item => item.name)
    );
    
    if (unreviewedProductNames.size === 0) {
      toast({
        title: t('dashboardOrders.noItemsToReviewTitle'),
        description: t('dashboardOrders.noItemsToReviewDesc'),
      });
      handleReviewPromptClose();
      return;
    }
    
    const productsToPass = products.filter(p => unreviewedProductNames.has(p.name));
    setProductsForReview(productsToPass);
    setIsReviewDialogOpen(true);
    handleReviewPromptClose();
  };

  const leaderboardRank = useMemo(() => {
    if (!user || isAdmin) return null;
    const sortedUsers = [...allUsers]
      .filter(u => !u.isAdmin)
      .sort((a, b) => b.totalSpent - a.totalSpent);
    const userIndex = sortedUsers.findIndex(u => u.id === user.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  }, [allUsers, user, isAdmin]);


  // Rank logic
  const totalXp = user ? user.totalSpent * USD_TO_XP_RATE : 0;
  const rank = user ? getRank(user.totalSpent) : null;
  const nextRank = user ? getNextRank(user.totalSpent) : null;
  const currentRankThreshold = rank?.threshold ?? 0;
  const nextRankThreshold = nextRank?.threshold ?? 0;
  const progressToNextRank = totalXp - currentRankThreshold;
  const requiredForNextRank = nextRankThreshold - currentRankThreshold;
  const progressPercentage = requiredForNextRank > 0 ? (progressToNextRank / requiredForNextRank) * 100 : (nextRank ? 0 : 100);
  const amountToNextRank = nextRank ? nextRank.threshold - totalXp : 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/products', label: t('nav.products') },
    { href: '/categories', label: t('nav.categories') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/reviews', label: t('nav.reviews') },
  ];

  const [totalItems, setTotalItems] = useState(0);
  const isWinterTheme = theme === 'winter-wonderland';

  useEffect(() => {
    setTotalItems(items.reduce((acc, item) => acc + item.quantity, 0));
  }, [items]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
  }
  
  const UserProfileDropdownContent = () => (
     <DropdownMenuContent className="w-64" align={locale === 'ar' ? 'start' : 'end'} forceMount>
      <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
          </p>
          </div>
      </DropdownMenuLabel>
      
      {isAuthenticated && !isAdmin && rank && (
          <>
          <DropdownMenuSeparator />
          <div className="px-2 py-2 text-sm">
              <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                      <rank.icon className={cn("h-4 w-4", rank.iconColor || rank.color)} />
                      <span className={rank.color}>{rank.name}</span>
                  </div>
                  {nextRank && (
                      <div className={cn("flex items-center gap-1.5 font-semibold text-xs", nextRank.color)}>
                          <span>{nextRank.name}</span>
                          <nextRank.icon className={cn("h-4 w-4", nextRank.iconColor || nextRank.color)} />
                      </div>
                  )}
              </div>
              {nextRank ? (
              <div className="space-y-1">
                  <Progress value={progressPercentage} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-center pt-1">
                      {t('dashboardSettings.nextRankProgressText', { xp: formatXp(amountToNextRank) })}
                  </p>
              </div>
              ) : (
              <div className="text-xs text-center font-semibold text-primary py-1">{t('dashboardSettings.maxRankText')}</div>
              )}
          </div>
          </>
      )}
    
      <DropdownMenuSeparator />
      {isAdmin ? (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
              <LayoutDashboard className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
              <span>{t('auth.adminDashboard')}</span>
          </DropdownMenuItem>
      ) : (
          <>
              {leaderboardRank && (
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span>{t('auth.yourRank', { rank: leaderboardRank })}</span>
                    </div>
                  </DropdownMenuLabel>
              )}
              <DropdownMenuItem onClick={() => router.push('/leaderboard')}>
                  <Crown className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
                  <span>{t('leaderboard.fullTitle')}</span>
              </DropdownMenuItem>
              {!user?.isPremium && (
                <DropdownMenuItem onClick={() => router.push('/premium')}>
                  <Gem className={cn("h-4 w-4 text-primary", locale === 'ar' ? 'ml-2' : 'mr-2')} />
                  <span>{t('nav.goPremium')}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push('/dashboard/orders')}>
                  <LayoutDashboard className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
                  <span>{t('dashboardSidebar.myOrders')}</span>
              </DropdownMenuItem>
          </>
      )}
      <DropdownMenuItem onClick={handleLogout}>
          <LogOut className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
          <span>{t('auth.logout')}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (!isMounted) {
    return (
      <>
        <div className="bg-background">
          <div className="container mx-auto px-4 py-2">
            <Skeleton className="h-11 rounded-full" />
          </div>
        </div>
        <div className="sticky top-0 z-50 w-full bg-background border-b">
          <header className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Skeleton className="h-8 w-32" />
              <div className="hidden md:flex items-center gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
        </div>
      </>
    );
  }

  return (
    <>
      {announcementEnabled && announcementText && (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-2">
                <div className="bg-accent text-accent-foreground text-sm font-medium p-3 rounded-full flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow">
                    <Megaphone className="h-5 w-5 shrink-0" />
                    <p>{announcementText}</p>
                </div>
            </div>
        </div>
      )}
      <div className="sticky top-0 z-50 w-full bg-background">
        <header className="relative w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logo" width={32} height={32} className="rounded-sm" unoptimized={logoUrl.startsWith('data:image')} />
                ) : (
                  <Flame className="h-6 w-6 text-primary" />
                )}
                <h1 className="text-xl font-bold font-headline">{siteTitle}</h1>
              </Link>

              <nav className="hidden md:flex items-center gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
                  <CurrencySwitcher />
                  <LanguageSwitcher />
                  <Button onClick={() => setSheetOpen(true)} variant="outline" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                          {totalItems}
                      </span>
                      )}
                      <span className="sr-only">Open Cart</span>
                  </Button>
                  
                  {isAuthenticated ? (
                      <>
                      {!isAdmin && (
                        <>
                          <div className="flex items-center gap-2 p-2 pr-3 bg-secondary rounded-md border">
                            <Wallet className="h-5 w-5 text-primary"/>
                            <span className="font-semibold text-sm whitespace-nowrap">{formatPrice(user?.walletBalance ?? 0)}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 pr-3 bg-secondary rounded-md border">
                            <Coins className="h-5 w-5 text-amber-500"/>
                            <span className="font-semibold text-sm whitespace-nowrap">{formatCoins(user?.valhallaCoins ?? 0)}</span>
                          </div>
                        </>
                      )}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                              <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.avatar} asChild>
                                <Image src={user?.avatar || ''} alt={user?.name || ''} width={32} height={32} unoptimized={user?.isPremium && user?.avatar?.endsWith('.gif')} />
                              </AvatarImage>
                              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {isWinterTheme && (
                                <div className="absolute -top-2 -right-2 transform rotate-12" style={{ width: '24px', height: '24px' }}>
                                  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path d="M41,112.5c-11.85,0-21.5-9.65-21.5-21.5S29.15,69.5,41,69.5h38c11.85,0,21.5,9.65,21.5,21.5S90.85,112.5,79,112.5H41z" fill="#fff"/>
                                    <path d="M79,77.5H41c-3.83,0-7.3,1.75-9.65,4.55L70.5,21.5c1.92-3.32,5.55-5.5,9.7-5.5c6.63,0,12,5.37,12,12 c0,4.15-2.18,7.78-5.5,9.7L79,77.5z" fill="#ef4444"/>
                                    <circle cx="91.5" cy="27.5" r="11" fill="#fff"/>
                                  </svg>
                                </div>
                              )}
                          </Button>
                          </DropdownMenuTrigger>
                          <UserProfileDropdownContent />
                      </DropdownMenu>
                      </>
                  ) : (
                      <div className="flex items-center gap-2">
                          <Button asChild variant="ghost" size="sm">
                              <Link href="/login">{t('auth.login')}</Link>
                          </Button>
                          <Button asChild size="sm">
                              <Link href="/register">{t('auth.register')}</Link>
                          </Button>
                      </div>
                  )}
              </div>

            {/* Mobile Nav */}
            <div className="flex items-center gap-2 md:hidden">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} asChild>
                              <Image src={user?.avatar || ''} alt={user?.name || ''} width={32} height={32} unoptimized={user?.isPremium && user?.avatar?.endsWith('.gif')} />
                            </AvatarImage>
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <UserProfileDropdownContent />
                  </DropdownMenu>
                ) : (
                    <Button asChild variant="ghost" size="sm" className="px-2">
                        <Link href="/login">{t('auth.login')}</Link>
                    </Button>
                )}
                
                <Button onClick={() => setSheetOpen(true)} variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                      {totalItems}
                    </span>
                  )}
                  <span className="sr-only">Open Cart</span>
                </Button>
                
                <Button onClick={() => setMobileMenuOpen(true)} variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
            </div>

          </div>
        </header>
      </div>
      
      <div 
        className={cn("fixed inset-0 z-[60] md:hidden", !isMobileMenuOpen && "pointer-events-none")}
      >
        <div 
            className={cn("absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity", isMobileMenuOpen ? "opacity-100" : "opacity-0")}
            onClick={() => setMobileMenuOpen(false)}
        />
        <div 
            className={cn(
                "absolute top-0 h-full w-4/5 max-w-xs bg-background p-6 shadow-xl transition-transform duration-300 ease-in-out",
                locale === 'ar' ? "right-0" : "left-0",
                isMobileMenuOpen
                    ? "translate-x-0"
                    : locale === 'ar' ? "translate-x-full" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    {logoUrl ? (
                        <Image src={logoUrl} alt="Logo" width={32} height={32} className="rounded-sm" unoptimized={logoUrl.startsWith('data:image')} />
                    ) : (
                        <Flame className="h-6 w-6 text-primary" />
                    )}
                    <h1 className="text-xl font-bold font-headline">{siteTitle}</h1>
                </Link>
                <Button onClick={() => setMobileMenuOpen(false)} variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                </Button>
            </div>
            <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground",
                      locale === 'ar' && "text-right"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>
             <div className="mt-8 pt-6 border-t space-y-4">
                 <div className="flex justify-around">
                    <CurrencySwitcher />
                    <LanguageSwitcher />
                 </div>
            </div>
        </div>
      </div>

      <CartSheet isOpen={isSheetOpen} onOpenChange={setSheetOpen} />

      <AlertDialog open={isReviewPromptOpen} onOpenChange={setIsReviewPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboardOrders.reviewPromptTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dashboardOrders.reviewPromptDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleReviewPromptClose}>
                {t('dashboardOrders.reviewPromptMaybeLater')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReviewPromptAction}>
                {t('dashboardOrders.reviewPromptLeaveReview')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('reviewForm.title')}</DialogTitle>
            <DialogDescription>
                {t('reviewForm.description')}
            </DialogDescription>
          </DialogHeader>
          <ReviewForm 
            onReviewSubmitted={() => setIsReviewDialogOpen(false)} 
            productsToReview={productsForReview}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
