

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
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-orders';
import { usePaymentSettings } from '@/hooks/use-payment-settings';
import { useCategories } from '@/hooks/use-categories';
import type { PaymentMethod, CartItem, Order } from '@/lib/types';
import { Minus, Plus, Trash2, Landmark, Wallet as WalletIcon, CreditCard, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';


interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const icons: { [key: string]: React.ElementType } = {
  Landmark,
  Wallet: WalletIcon,
  CreditCard,
};

const PaymentInstructions = ({ method }: { method: PaymentMethod | null }) => {
    if (!method) return null;
    return (
        <div className="text-sm space-y-2 whitespace-pre-wrap">
            <p>{method.instructions}</p>
        </div>
    );
};

const CustomFieldsDisplay = ({ item }: { item: CartItem }) => {
    const { categories } = useCategories();
    const category = categories.find(c => c.name === item.category);

    if (!item.customFieldValues || Object.keys(item.customFieldValues).length === 0) {
        return null;
    }

    if (!category || !category.customFields) return null;

    return (
        <div className="text-xs space-y-1 mt-2">
            {category.customFields.map(field => {
                const value = item.customFieldValues?.[field.name];
                if (!value) return null;
                return (
                    <div key={field.id} className="flex justify-between">
                        <span className="text-muted-foreground">{field.label}:</span>
                        <span className="font-semibold truncate ml-2">{value}</span>
                    </div>
                )
            })}
        </div>
    )
}

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, clearCart, updateCustomFieldValue } = useCart();
  const { paymentMethods } = usePaymentSettings();
  const { categories } = useCategories();
  const { addOrder } = useOrders();
  const { user, isAuthenticated, updateWalletBalance } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [paymentProofImage, setPaymentProofImage] = useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.name, c])), [categories]);

  const subtotal = useMemo(() =>
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );
  
  const taxRate = selectedPayment?.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  const walletPaymentMethod: PaymentMethod = {
    id: 'store_wallet',
    name: 'Store Wallet',
    icon: 'Wallet',
    instructions: 'The order total will be deducted from your available wallet balance.',
    requiresProof: false,
    taxRate: 0,
  };

  const isWalletDisabled = !isAuthenticated || (user?.walletBalance ?? 0) < total;

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPaymentProofImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = () => {
     if (!isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or create an account to place an order.",
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Please add items to your cart before submitting.",
      });
      return;
    }

    for (const item of items) {
        const category = categoryMap.get(item.category);
        const customFields = category?.deliveryMethod === 'manual' ? category.customFields : [];
        if (customFields && customFields.length > 0) {
            for (const field of customFields) {
                if (!item.customFieldValues?.[field.name]) {
                    toast({
                        variant: "destructive",
                        title: "Missing Information",
                        description: `Please fill out the '${field.label}' for ${item.name}.`,
                    });
                    return;
                }
            }
        }
    }

    if (!selectedPayment) {
       toast({
        variant: "destructive",
        title: "No Payment Method",
        description: "Please select a payment method.",
      });
      return;
    }

    if (selectedPayment.requiresProof && !paymentProofImage) {
        toast({
            variant: "destructive",
            title: "Payment Proof Required",
            description: `Please upload proof of payment for the ${selectedPayment.name} method.`,
        });
        return;
    }

    if (selectedPayment.id === 'store_wallet') {
        if (user && user.walletBalance >= total) {
            updateWalletBalance(user.id, -total);
        } else {
            toast({
                variant: "destructive",
                title: "Insufficient Balance",
                description: "You do not have enough funds in your wallet to complete this purchase.",
            });
            return;
        }
    }
    
    const newOrderId = `TUH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setOrderId(newOrderId);
    
    const newOrder: Omit<Order, 'createdAt'> = {
        id: newOrderId,
        customer: user,
        items,
        total,
        paymentMethod: selectedPayment,
        paymentProofImage,
        status: 'pending',
    };
    addOrder(newOrder);
    setConfirmOpen(true);
  };

  const handleCloseConfirmation = () => {
    setConfirmOpen(false);
    clearCart();
    setSelectedPayment(null);
    setPaymentProofImage(null);
    onOpenChange(false);
  };
  
  const handlePaymentChange = (id: string) => {
    setPaymentProofImage(null);
    if (id === 'store_wallet') {
        setSelectedPayment(walletPaymentMethod);
    } else {
        setSelectedPayment(paymentMethods.find(p => p.id === id) || null);
    }
  }

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
                  {items.map((item) => {
                    const category = categoryMap.get(item.category);
                    const customFields = category?.deliveryMethod === 'manual' ? category.customFields : [];
                    
                    return (
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
                            {customFields && customFields.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {customFields.map(field => (
                                        <div key={field.id} className="space-y-1">
                                            <Label htmlFor={`${item.id}-${field.name}`}>{field.label}</Label>
                                            <Input
                                                id={`${item.id}-${field.name}`}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={item.customFieldValues?.[field.name] || ''}
                                                onChange={(e) => updateCustomFieldValue(item.id, field.name, e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    );
                  })}
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
                <RadioGroup onValueChange={handlePaymentChange}>
                  <div className="flex items-center space-x-2">
                     <RadioGroupItem value={walletPaymentMethod.id} id={walletPaymentMethod.id} disabled={isWalletDisabled} />
                     <Label htmlFor={walletPaymentMethod.id} className={cn("flex items-center gap-2 cursor-pointer", isWalletDisabled && "text-muted-foreground opacity-50")}>
                       <WalletIcon className="h-5 w-5" />
                       Store Wallet ({formatPrice(user?.walletBalance ?? 0)})
                     </Label>
                  </div>
                  {paymentMethods.map(method => {
                    const Icon = icons[method.icon];
                    return (
                        <div key={method.id} className="flex items-center space-x-2">
                           <RadioGroupItem value={method.id} id={method.id} />
                           <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                             {Icon && <Icon className="h-5 w-5" />}
                             {method.name}
                           </Label>
                        </div>
                    )
                  })}
                </RadioGroup>
                {selectedPayment && (
                    <div className="mt-4 p-3 bg-background rounded-md border text-sm space-y-4">
                        <PaymentInstructions method={selectedPayment} />
                        {selectedPayment.requiresProof && (
                            <div>
                                <Separator className="my-3" />
                                <Label htmlFor="payment-proof" className="font-semibold flex items-center gap-2 mb-2">
                                    <Upload className="h-4 w-4" /> Upload Payment Proof
                                </Label>
                                <Input id="payment-proof" type="file" accept="image/*" onChange={handlePaymentProofChange} className="file:text-primary file:font-semibold h-auto" />
                                {paymentProofImage && (
                                    <div className="relative aspect-video w-32 mt-2 rounded-md border">
                                        <Image src={paymentProofImage} alt="Payment proof preview" fill className="object-contain rounded-md" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
              </div>
              <SheetFooter className="mt-auto">
                <div className="w-full space-y-2">
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('cart.tax')} ({taxRate}%)</span>
                            <span>{formatPrice(taxAmount)}</span>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>{t('cart.total')}</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                    <Button onClick={handleSubmitOrder} className="w-full" size="lg" disabled={!isAuthenticated || !selectedPayment}>
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
          <ScrollArea className="max-h-60">
            <div className="my-4 space-y-4">
              <h4 className="font-semibold">Order Summary</h4>
              {items.map(item => (
                  <div key={item.id} className="p-2 border rounded-md">
                      <p className="font-semibold">{item.name} <span className="text-muted-foreground font-normal">x {item.quantity}</span></p>
                      <CustomFieldsDisplay item={item} />
                  </div>
              ))}
              {paymentProofImage && (
                <div className="space-y-2">
                    <h4 className="font-semibold">Payment Proof</h4>
                    <div className="relative aspect-video w-full rounded-md border">
                        <Image src={paymentProofImage} alt="Payment proof" fill className="object-contain rounded-md" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {selectedPayment && (
            <div className="my-4 p-4 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {React.createElement(icons[selectedPayment.icon], { className: 'h-5 w-5' })}
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
