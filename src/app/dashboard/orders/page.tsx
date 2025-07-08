
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/hooks/use-auth';
import type { Order, OrderStatus, CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, RefreshCw, KeyRound, Copy } from 'lucide-react';
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
    const { toast } = useToast();
    const deliveredCodes = order.deliveredItems?.[item.id];
    if (order.status !== 'completed' || !deliveredCodes || deliveredCodes.length === 0) return null;

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: 'Code Copied!', description: 'The code has been copied to your clipboard.' });
    };

    return (
        <Card className="mt-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="p-2">
                <CardTitle className="text-xs text-green-800 dark:text-green-300 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Delivered Code(s)</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
                <div className="space-y-1">
                    {deliveredCodes.map((code, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-1 rounded-md">
                            <code className="text-xs font-mono">{code}</code>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(code)}>
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
  const { formatPrice } = useCurrency();

  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(order => order.customer.id === user.id);
  }, [orders, user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Here's a history of all your purchases.</p>
      </div>

      <Dialog open={!!viewingOrder} onOpenChange={(isOpen) => !isOpen && setViewingOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
           <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>ID: {viewingOrder?.id}</DialogDescription>
            </DialogHeader>
            {viewingOrder && (
                <ScrollArea className="max-h-[70vh]">
                    <div className="pr-6 space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Items</h4>
                            <div className="space-y-4">
                                {viewingOrder.items.map(item => (
                                    <div key={item.id} className="flex flex-col gap-2 p-2 border rounded-md">
                                        <div className="flex gap-4">
                                            <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md object-cover" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity} x {formatPrice(item.price)}
                                                </p>
                                                <CustomFieldsDisplay item={item} />
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.quantity * item.price)}</p>
                                        </div>
                                        <DeliveredItemsDisplay order={viewingOrder} item={item} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <h4 className="font-semibold mb-2">Payment</h4>
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span>{viewingOrder.paymentMethod.name}</span>
                                </div>
                                 <div className="flex justify-between font-bold text-base">
                                    <span>Total:</span>
                                    <span>{formatPrice(viewingOrder.total)}</span>
                                </div>
                            </div>
                            {viewingOrder.paymentProofImage && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">Payment Proof</h4>
                                    <div className="relative aspect-video w-full border rounded-md">
                                        <Image src={viewingOrder.paymentProofImage} alt="Payment Proof" layout="fill" className="object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            )}
             <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>A list of all your past orders.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.length > 0 ? customerOrders.map((order) => {
                const statusInfo = statusConfig[order.status];
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setViewingOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">You haven't placed any orders yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
