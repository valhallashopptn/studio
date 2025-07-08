
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Flame, LogOut, LayoutDashboard, Wallet, Megaphone, Menu, X } from 'lucide-react';
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


export function AppHeader() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Hooks that rely on client-side state
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCart((state) => state.items);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { logoUrl, siteTitle } = useSiteSettings();
  const { announcementEnabled, announcementText } = useContentSettings();
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { formatPrice } = useCurrency();

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
  
  // Render a skeleton placeholder until the component has mounted on the client
  if (!isMounted) {
    return (
      <div className="sticky top-0 z-50 w-full bg-background">
        {/* Placeholder for announcement bar height */}
        <div className="h-[40px] bg-muted/50"></div>
        {/* Placeholder for main header */}
        <header className="relative w-full border-b bg-background">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-sm bg-muted"></div>
              <div className="h-6 w-24 rounded-md bg-muted"></div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-background">
        {announcementEnabled && announcementText && (
          <div className="bg-accent text-accent-foreground text-sm py-2 overflow-hidden">
            <div className="container flex items-center justify-center">
              <div className="flex items-center gap-4 animate-slide-down-up">
                <Megaphone className="h-5 w-5 shrink-0" />
                <p>
                  {announcementText}
                </p>
              </div>
            </div>
          </div>
        )}
        <header className="relative w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <div className={cn("flex flex-1 items-center gap-6", locale === 'ar' ? 'flex-row-reverse' : '')}>
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

            <div className="flex items-center gap-2 md:hidden">
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
            
            <div className={cn("hidden md:flex absolute top-1/2 -translate-y-1/2 items-center gap-2", locale === 'ar' ? "left-6" : "right-6")}>
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
                        <div className="flex items-center gap-2 p-2 pr-3 bg-secondary rounded-md border">
                        <Wallet className="h-5 w-5 text-primary"/>
                        <span className="font-semibold text-sm whitespace-nowrap">{formatPrice(user?.walletBalance ?? 0)}</span>
                        </div>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                            </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!isAdmin && (
                            <>
                            <DropdownMenuItem disabled>
                                <Wallet className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
                                <span>{formatPrice(user?.walletBalance ?? 0)}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem onClick={() => router.push(isAdmin ? '/admin' : '/dashboard/orders')}>
                            <LayoutDashboard className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
                            <span>{t('auth.dashboard')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className={cn("h-4 w-4", locale === 'ar' ? 'ml-2' : 'mr-2')} />
                            <span>{t('auth.logout')}</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
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
          </div>
        </header>
      </div>
      
      <div className={cn("fixed inset-0 z-[60] md:hidden", !isMobileMenuOpen && "pointer-events-none")}>
        <div 
            className={cn("absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity", isMobileMenuOpen ? "opacity-100" : "opacity-0")}
            onClick={() => setMobileMenuOpen(false)}
        />
        <div className={cn(
            "absolute top-0 h-full w-4/5 max-w-xs bg-background p-6 shadow-xl transition-transform duration-300 ease-in-out",
            locale === 'ar' ? "right-0" : "left-0",
            isMobileMenuOpen
                ? "translate-x-0"
                : locale === 'ar' ? "translate-x-full" : "-translate-x-full"
        )}>
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
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
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
                 {isAuthenticated ? (
                    <div className="space-y-3">
                       <Button asChild className="w-full" variant="secondary" onClick={() => setMobileMenuOpen(false)}>
                           <Link href={isAdmin ? '/admin' : '/dashboard/orders'}>
                             <LayoutDashboard className={cn(locale === 'ar' ? 'ml-2' : 'mr-2')}/> {t('auth.dashboard')}
                           </Link>
                       </Button>
                       <Button asChild className="w-full" variant="destructive" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                           <button><LogOut className={cn(locale === 'ar' ? 'ml-2' : 'mr-2')}/> {t('auth.logout')}</button>
                       </Button>
                    </div>
                 ) : (
                    <div className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>{t('auth.login')}</Link>
                        </Button>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>{t('auth.register')}</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <CartSheet isOpen={isSheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
