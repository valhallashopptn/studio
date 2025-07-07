"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Flame } from 'lucide-react';
import { CartSheet } from '@/components/cart-sheet';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
];

export function AppHeader() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const items = useCart((state) => state.items);
  const pathname = usePathname();

  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setTotalItems(items.reduce((acc, item) => acc + item.quantity, 0));
  }, [items]);
  
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold font-headline">TopUp Hub</h1>
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
          <Button onClick={() => setSheetOpen(true)} variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                {totalItems}
              </span>
            )}
            <span className="sr-only">Open Cart</span>
          </Button>
        </div>
      </header>
      <CartSheet isOpen={isSheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
