
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import type { PaymentMethod, CartItem, Order, Category } from '@/lib/types';
import { Landmark, Wallet as WalletIcon, CreditCard, Upload, Loader2, User, Info, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart, updateCustomFieldValue } = useCart();
    const { paymentMethods } = usePaymentSettings();
    const { categories } = useCategories();
    const { addOrder } = useOrders();
    const { user, isAuthenticated, updateWalletBalance } = useAuth();
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
    const [paymentProofImage, setPaymentProofImage] = useState<string | null>(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState('');
    const { toast } = useToast();
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (items.length === 0) {
            toast({
                title: 'Your cart is empty',
                description: 'Please add products to your cart before checking out.',
                variant: 'destructive',
            });
            router.push('/products');
            return;
        }
        setIsVerified(true);
    }, [isAuthenticated, items, router, toast]);


    const categoryMap = useMemo(() => new Map(categories.map(c => [c.name, c])), [categories]);
    const itemsWithCustomFields = useMemo(() => items.filter(item => {
        const category = categoryMap.get(item.category);
        return category?.deliveryMethod === 'manual' && category.customFields.length > 0;
    }), [items, categoryMap]);

    const subtotal = useMemo(() =>
        items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        [items]
    );

    const taxRate = selectedPayment?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const walletPaymentMethod: PaymentMethod = {
        id: 'store_wallet',
        name: t('checkoutPage.storeWallet'),
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
        setIsProcessing(true);
        // Basic validation
        for (const item of itemsWithCustomFields) {
            const category = categoryMap.get(item.category);
            for (const field of category!.customFields) {
                if (!item.customFieldValues?.[field.name]) {
                    toast({
                        variant: "destructive",
                        title: "Missing Information",
                        description: `Please fill out the '${field.label}' field for ${item.name}.`,
                    });
                    setIsProcessing(false);
                    return;
                }
            }
        }
        if (!selectedPayment) {
           toast({ variant: "destructive", title: "No Payment Method", description: "Please select a payment method." });
           setIsProcessing(false);
           return;
        }
        if (selectedPayment.requiresProof && !paymentProofImage) {
            toast({ variant: "destructive", title: "Payment Proof Required", description: `Please upload proof of payment for the ${selectedPayment.name} method.` });
            setIsProcessing(false);
            return;
        }

        // Simulate processing
        setTimeout(() => {
            if (selectedPayment.id === 'store_wallet') {
                if (user && user.walletBalance >= total) {
                    updateWalletBalance(user.id, -total);
                } else {
                    toast({ variant: "destructive", title: "Insufficient Balance", description: "Your wallet balance is too low to complete this purchase." });
                    setIsProcessing(false);
                    return;
                }
            }
            
            const newOrderId = `TUH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            setOrderId(newOrderId);
            
            const newOrder: Omit<Order, 'createdAt'> = {
                id: newOrderId,
                customer: user!,
                items,
                total,
                paymentMethod: selectedPayment,
                paymentProofImage,
                status: 'pending',
            };
            addOrder(newOrder);
            setConfirmOpen(true);
            setIsProcessing(false);
        }, 1000);
    };

    const handleCloseConfirmation = () => {
        setConfirmOpen(false);
        clearCart();
        setSelectedPayment(null);
        setPaymentProofImage(null);
        router.push('/dashboard/orders');
    };
    
    const handlePaymentChange = (id: string) => {
        setPaymentProofImage(null);
        if (id === 'store_wallet') {
            setSelectedPayment(walletPaymentMethod);
        } else {
            setSelectedPayment(paymentMethods.find(p => p.id === id) || null);
        }
    };

    if (!isVerified) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 py-16 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold font-headline text-primary">{t('checkoutPage.title')}</h1>
                        <p className="mt-2 text-lg text-muted-foreground">{t('checkoutPage.subtitle')}</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/>{t('checkoutPage.customerInfo')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><strong>{t('checkoutPage.name')}</strong> {user?.name}</p>
                                    <p><strong>{t('checkoutPage.email')}</strong> {user?.email}</p>
                                </CardContent>
                            </Card>

                            {itemsWithCustomFields.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>{t('checkoutPage.requiredInfo')}</CardTitle>
                                        <CardDescription>{t('checkoutPage.requiredInfoDesc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {itemsWithCustomFields.map(item => {
                                            const category = categoryMap.get(item.category) as Category;
                                            return (
                                                <div key={item.id} className="p-4 border rounded-lg">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <div className="mt-4 space-y-3">
                                                        {category.customFields.map(field => (
                                                            <div key={field.id} className="space-y-1">
                                                                <Label htmlFor={`${item.id}-${field.name}`}>{field.label}</Label>
                                                                <Input
                                                                    id={`${item.id}-${field.name}`}
                                                                    type={field.type}
                                                                    placeholder={field.placeholder}
                                                                    value={item.customFieldValues?.[field.name] || ''}
                                                                    onChange={(e) => updateCustomFieldValue(item.id, field.name, e.target.value)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                </Card>
                            )}
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary"/>{t('checkoutPage.paymentMethod')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup onValueChange={handlePaymentChange}>
                                        <div className="space-y-3">
                                            <Label htmlFor={walletPaymentMethod.id} className={cn("flex items-start gap-4 p-4 border rounded-lg has-[:checked]:bg-primary/5 has-[:checked]:border-primary transition-all", isWalletDisabled && "opacity-50")}>
                                                <RadioGroupItem value={walletPaymentMethod.id} id={walletPaymentMethod.id} disabled={isWalletDisabled} />
                                                <div className="grid gap-1.5 leading-none">
                                                    <span className="font-semibold flex items-center gap-2"><WalletIcon className="h-5 w-5" /> {t('checkoutPage.storeWallet')} ({formatPrice(user?.walletBalance ?? 0)})</span>
                                                    {isWalletDisabled && <span className="text-xs text-destructive">{t('checkoutPage.insufficientBalance')}</span>}
                                                </div>
                                            </Label>
                                            {paymentMethods.map(method => {
                                                const Icon = icons[method.icon];
                                                return (
                                                    <Label key={method.id} htmlFor={method.id} className="flex items-start gap-4 p-4 border rounded-lg has-[:checked]:bg-primary/5 has-[:checked]:border-primary transition-all">
                                                        <RadioGroupItem value={method.id} id={method.id} />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <span className="font-semibold flex items-center gap-2">{Icon && <Icon className="h-5 w-5" />} {method.name}</span>
                                                        </div>
                                                    </Label>
                                                )
                                            })}
                                        </div>
                                    </RadioGroup>
                                    {selectedPayment && (
                                        <div className="mt-6 p-4 bg-secondary rounded-md border text-sm space-y-4">
                                            <PaymentInstructions method={selectedPayment} />
                                            {selectedPayment.requiresProof && (
                                                <div>
                                                    <Separator className="my-3 bg-border/50" />
                                                    <Label htmlFor="payment-proof" className="font-semibold flex items-center gap-2 mb-2">
                                                        <Upload className="h-4 w-4" /> {t('checkoutPage.uploadProof')}
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
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>{t('checkoutPage.orderSummary')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ScrollArea className="h-64 pr-3">
                                        <div className="space-y-4">
                                            {items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                                        <div>
                                                            <p className="font-semibold">{item.name}</p>
                                                            <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold">{formatPrice(item.quantity * item.price)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <Separator/>
                                    <div className="space-y-2 text-sm">
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
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSubmitOrder} className="w-full" size="lg" disabled={isProcessing || !selectedPayment}>
                                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isProcessing ? t('checkoutPage.processing') : t('checkoutPage.placeOrder')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <AlertDialog open={isConfirmOpen} onOpenChange={() => {}}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('cart.orderPlaced')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('cart.orderId')} <span className="font-bold text-primary">{orderId}</span>.
                      Your order is now pending. Please check your order history for updates.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                   <AlertDialogFooter>
                    <AlertDialogAction onClick={handleCloseConfirmation}>{t('checkoutPage.viewMyOrders')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AppFooter />
        </div>
    );
}
