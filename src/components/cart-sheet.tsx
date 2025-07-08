
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/hooks/use-currency';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity } = useCart();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const subtotal = useMemo(() =>
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  
  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('cart.title')}</SheetTitle>
          <SheetDescription>{t('cart.description')}</SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex-1">
          {items.length > 0 ? (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                      <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <Input type="number" value={item.quantity} readOnly className="h-6 w-12 text-center" />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between h-full">
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">{t('cart.empty')}</p>
              <SheetClose asChild>
                <Button asChild variant="link" className="mt-2">
                    <Link href="/products">Start Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                      <span>{t('cart.subtotal')}</span>
                      <span>{formatPrice(subtotal)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full" size="lg">
                      Proceed to Checkout
                  </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
