
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useOrders } from '@/hooks/use-orders';
import type { Order, OrderStatus, CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
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
import { categories as initialCategories } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusConfig: { [key in OrderStatus]: { variant: 'default' | 'secondary' | 'destructive', icon: React.ElementType, label: string } } = {
  pending: { variant: 'secondary', icon: RefreshCw, label: 'Pending' },
  completed: { variant: 'default', icon: CheckCircle, label: 'Completed' },
  refunded: { variant: 'destructive', icon: XCircle, label: 'Refunded' },
};

const CustomFieldsDisplay = ({ item }: { item: CartItem }) => {
    const categoryMap = useMemo(() => new Map(initialCategories.map(c => [c.name, c])), []);
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
}

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders.</p>
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
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold">Customer</h4>
                                <p>{viewingOrder.customer.name}</p>
                                <p className="text-muted-foreground">{viewingOrder.customer.email}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold">Date</h4>
                                <p>{format(new Date(viewingOrder.createdAt), 'PPpp')}</p>
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <h4 className="font-semibold mb-2">Items</h4>
                            <div className="space-y-4">
                                {viewingOrder.items.map(item => (
                                    <div key={item.id} className="flex gap-4 p-2 border rounded-md">
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
          <CardDescription>A list of all orders placed in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'P')}</TableCell>
                    <TableCell className="font-medium">{order.customer.name}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="gap-1">
                        <statusInfo.icon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                <span>Update Status</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {Object.entries(statusConfig).map(([statusKey, config]) => (
                                        <DropdownMenuItem key={statusKey} onClick={() => updateOrderStatus(order.id, statusKey as OrderStatus)}>
                                            <config.icon className="mr-2 h-4 w-4" />
                                            {config.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
