
"use client";

import React, { useState, useMemo } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCart } from '@/hooks/use-cart';
import { paymentMethods } from '@/lib/data';
import type { PaymentMethod } from '@/lib/types';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/use-translation';


interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PaymentInstructions = ({ method }: { method: PaymentMethod | null }) => {
    if (!method) return null;

    if (method.id === 'bank_transfer') {
        return (
            <div className="text-sm space-y-2">
                <p>Please transfer the total amount to the following bank account:</p>
                <p><strong>Bank:</strong> First National Bank</p>
                <p><strong>Account Name:</strong> TopUp Hub Inc.</p>
                <p><strong>Account Number:</strong> 123-456-7890</p>
                <p className="font-semibold">Please include your Order ID in the transaction description.</p>
            </div>
        );
    }

    if (method.id === 'e_wallet') {
        return (
            <div className="text-sm space-y-2">
                <p>Please send the total amount to the following e-wallet account:</p>
                <p><strong>Service:</strong> PayNow</p>
                <p><strong>Recipient Name:</strong> TopUp Hub</p>
                <p><strong>Phone Number:</strong> +1 987 654 3210</p>
                <p className="font-semibold">Please include your Order ID in the payment reference.</p>
            </div>
        );
    }

    return null;
};

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const total = useMemo(() =>
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const handleSubmitOrder = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to your cart before submitting.",
      });
      return;
    }
    if (!selectedPayment) {
       toast({
        variant: "destructive",
        title: "No Payment Method",
        description: "Please select a payment method.",
      });
      return;
    }
    setOrderId(`TUH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setConfirmOpen(true);
  };

  const handleCloseConfirmation = () => {
    setConfirmOpen(false);
    clearCart();
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('cart.title')}</SheetTitle>
            <SheetDescription>{t('cart.description')}</SheetDescription>
          </SheetHeader>
          <Separator />
          <div className="flex-1">
            {items.length > 0 ? (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                       <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                          <Input type="number" value={item.quantity} readOnly className="h-6 w-12 text-center" />
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
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
                <p>{t('cart.empty')}</p>
              </div>
            )}
          </div>
          {items.length > 0 && (
            <>
              <Separator />
              <div className="p-4 space-y-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold">{t('cart.paymentMethod')}</h4>
                <RadioGroup onValueChange={(id) => setSelectedPayment(paymentMethods.find(p => p.id === id) || null)}>
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center space-x-2">
                       <RadioGroupItem value={method.id} id={method.id} />
                       <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                         <method.icon className="h-5 w-5" />
                         {method.name}
                       </Label>
                    </div>
                  ))}
                </RadioGroup>
                {selectedPayment && (
                    <div className="mt-4 p-3 bg-background rounded-md border text-sm">
                        <PaymentInstructions method={selectedPayment} />
                    </div>
                )}
              </div>
              <SheetFooter className="mt-auto">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t('cart.total')}</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleSubmitOrder} className="w-full" size="lg">
                    {t('cart.submit')}
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cart.orderPlaced')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cart.orderId')} <span className="font-bold text-primary">{orderId}</span>.
              Please follow the payment instructions below to complete your purchase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedPayment && (
            <div className="my-4 p-4 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <selectedPayment.icon className="h-5 w-5" />
                    {selectedPayment.name} Instructions
                </h4>
                <PaymentInstructions method={selectedPayment} />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseConfirmation}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
