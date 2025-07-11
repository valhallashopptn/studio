
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/hooks/use-auth';
import type { Order, OrderStatus, CartItem, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, RefreshCw, KeyRound, Copy, TicketPercent, Coins, MessageSquarePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useCurrency } from '@/hooks/use-currency';
import { useCategories } from '@/hooks/use-categories';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { formatCoins } from '@/lib/ranks';

const statusConfig: { [key in OrderStatus]: { variant: 'default' | 'secondary' | 'destructive', icon: React.ElementType, label: string } } = {
  pending: { variant: 'secondary', icon: RefreshCw, label: 'Pending' },
  completed: { variant: 'default', icon: CheckCircle, label: 'Completed' },
  refunded: { variant: 'destructive', icon: XCircle, label: 'Refunded' },
};

const CustomFieldsDisplay = ({ item }: { item: CartItem }) => {
    const { categories } = useCategories();
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.name, c])), [categories]);
    const category = categoryMap.get(item.category);
    if (!category || category.deliveryMethod !== 'manual' || !item.customFieldValues || Object.keys(item.customFieldValues).length === 0) {
        return null;
    }

    return (
        <div className="text-xs space-y-1 mt-2 text-muted-foreground">
            {category.customFields.map(field => {
                const value = item.customFieldValues?.[field.name];
                if (!value) return null;
                return (
                    <div key={field.id} className="flex justify-between">
                        <span>{field.label}:</span>
                        <span className="font-semibold text-foreground truncate ml-2">{value}</span>
                    </div>
                )
            })}
        </div>
    )
};

const DeliveredItemsDisplay = ({ order, item }: { order: Order, item: CartItem }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const deliveredData = order.deliveredItems?.[item.id];
    if (order.status !== 'completed' || !deliveredData || deliveredData.length === 0) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "The information has been copied to your clipboard." });
    };

    return (
        <Card className="mt-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="p-2">
                <CardTitle className="text-xs text-green-800 dark:text-green-300 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Delivered Information</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
                <div className="space-y-1">
                    {deliveredData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-1.5 rounded-md">
                            <code className="text-xs font-mono whitespace-pre-wrap">{data}</code>
                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(data)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deliveryInfoOrder, setDeliveryInfoOrder] = useState<Order | null>(null);
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { toast } = useToast();

  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(order => order.customer.id === user.id);
  }, [orders, user]);

  const subtotal = viewingOrder ? viewingOrder.items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0) : 0;
  const taxAmount = viewingOrder ? (subtotal - (viewingOrder.discountAmount ?? 0) - (viewingOrder.valhallaCoinsValue ?? 0)) * ((viewingOrder.paymentMethod.taxRate ?? 0) / 100) : 0;
  
  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "The information has been copied to your clipboard." });
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboardOrders.title')}</h1>
        <p className="text-muted-foreground">{t('dashboardOrders.subtitle')}</p>
      </div>

      <Dialog open={!!deliveryInfoOrder} onOpenChange={(isOpen) => !isOpen && setDeliveryInfoOrder(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delivered Information</DialogTitle>
                <DialogDescription>Your delivery information for order {deliveryInfoOrder?.id}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-6 py-4">
                {deliveryInfoOrder?.items.map(item => {
                    const deliveredData = deliveryInfoOrder.deliveredItems?.[item.id];
                    if (!deliveredData || deliveredData.length === 0) return null;

                    return (
                        <div key={item.id} className="space-y-2">
                           <p className="font-semibold">{item.name} <span className="text-muted-foreground">({item.variant.name})</span></p>
                           <div className="space-y-1">
                               {deliveredData.map((data, index) => (
                                   <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                       <code className="text-sm font-mono whitespace-pre-wrap">{data}</code>
                                       <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(data)}>
                                           <Copy className="h-4 w-4" />
                                       </Button>
                                   </div>
                               ))}
                           </div>
                        </div>
                    )
                })}
            </div>
            </ScrollArea>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={!!viewingOrder} onOpenChange={(isOpen) => !isOpen && setViewingOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
           <DialogHeader>
                <DialogTitle>{t('dashboardOrders.orderDetails')}</DialogTitle>
                <DialogDescription>{t('dashboardOrders.id')} {viewingOrder?.id}</DialogDescription>
            </DialogHeader>
            {viewingOrder && (
                <ScrollArea className="max-h-[70vh]">
                    <div className="pr-6 space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">{t('dashboardOrders.items')}</h4>
                            <div className="space-y-4">
                                {viewingOrder.items.map(item => (
                                    <div key={item.id} className="flex flex-col gap-2 p-2 border rounded-md">
                                        <div className="flex gap-4">
                                            <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md object-cover" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.name} <span className="text-muted-foreground font-normal">({item.variant.name})</span></p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity} x {formatPrice(item.variant.price)}
                                                </p>
                                                <CustomFieldsDisplay item={item} />
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.quantity * item.variant.price)}</p>
                                        </div>
                                        <DeliveredItemsDisplay order={viewingOrder} item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <h4 className="font-semibold mb-2">{t('dashboardOrders.payment')}</h4>
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {viewingOrder.discountAmount && viewingOrder.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span className="text-muted-foreground flex items-center gap-1"><TicketPercent className="h-4 w-4" />{t('checkoutPage.discount')} ({viewingOrder.appliedCouponCode})</span>
                                        <span>- {formatPrice(viewingOrder.discountAmount)}</span>
                                    </div>
                                )}
                                {viewingOrder.valhallaCoinsValue && viewingOrder.valhallaCoinsValue > 0 && (
                                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                        <span className="text-muted-foreground flex items-center gap-1"><Coins className="h-4 w-4" />{t('checkoutPage.coinsRedeemed')} ({formatCoins(viewingOrder.valhallaCoinsApplied!)})</span>
                                        <span>- {formatPrice(viewingOrder.valhallaCoinsValue)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('cart.tax')} ({viewingOrder.paymentMethod.taxRate ?? 0}%)</span>
                                    <span>+ {formatPrice(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('dashboardOrders.method')}</span>
                                    <span>{viewingOrder.paymentMethod.name}</span>
                                </div>
                                 <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                                    <span>{t('dashboardOrders.total')}</span>
                                    <span>{formatPrice(viewingOrder.total)}</span>
                                </div>
                            </div>
                            {viewingOrder.paymentProofImage && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">{t('dashboardOrders.paymentProof')}</h4>
                                    <div className="relative aspect-video w-full border rounded-md">
                                        <Image src={viewingOrder.paymentProofImage} alt="Payment Proof" layout="fill" className="object-contain" />
                                    </div>
                                </div>
                            )}
                            {viewingOrder.status === 'refunded' && viewingOrder.refundedAt && (
                                <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm">
                                    <h4 className="font-semibold text-destructive mb-2">{t('dashboardOrders.refundDetails')}</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('dashboardOrders.refundedOn')}</span>
                                            <span>{format(new Date(viewingOrder.refundedAt), 'PPp')}</span>
                                        </div>
                                        {viewingOrder.refundReason && (
                                            <div className="flex justify-between items-start text-left">
                                                <span className="text-muted-foreground shrink-0">{t('dashboardOrders.reason')}</span>
                                                <p className="text-right ml-4">{viewingOrder.refundReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            )}
            <DialogFooter className="sm:justify-end items-center">
                <DialogClose asChild><Button type="button" variant="secondary">{t('dashboardOrders.close')}</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboardOrders.orderHistory')}</CardTitle>
          <CardDescription>{t('dashboardOrders.orderHistoryDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboardOrders.orderId')}</TableHead>
                <TableHead>{t('dashboardOrders.date')}</TableHead>
                <TableHead>{t('dashboardOrders.total')}</TableHead>
                <TableHead>{t('dashboardOrders.status')}</TableHead>
                <TableHead className="text-right">{t('dashboardOrders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.length > 0 ? customerOrders.map((order) => {
                const statusInfo = statusConfig[order.status];
                const hasDeliveredItems = order.status === 'completed' && order.deliveredItems && Object.keys(order.deliveredItems).length > 0;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'P')}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="gap-1">
                        <statusInfo.icon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       {hasDeliveredItems && (
                           <Button variant="outline" size="sm" onClick={() => setDeliveryInfoOrder(order)}>
                               <KeyRound className="mr-2 h-4 w-4" /> Delivery
                           </Button>
                       )}
                      <Button variant="ghost" size="sm" onClick={() => setViewingOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" /> {t('dashboardOrders.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">{t('dashboardOrders.noOrders')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
