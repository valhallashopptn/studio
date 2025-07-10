
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useOrders } from '@/hooks/use-orders';
import type { Order, OrderStatus, CartItem, Product, Category } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, CheckCircle, XCircle, RefreshCw, KeyRound, Copy, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useCurrency } from '@/hooks/use-currency';
import { useCategories } from '@/hooks/use-categories';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useStock } from '@/hooks/use-stock';
import { Input } from '@/components/ui/input';

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
}

const DeliveredItemsDisplay = ({ order, item }: { order: Order, item: CartItem }) => {
    const { toast } = useToast();
    const deliveredData = order.deliveredItems?.[item.id];
    if (order.status !== 'completed' || !deliveredData || deliveredData.length === 0) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'The information has been copied to your clipboard.' });
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


export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, updateDeliveredItems } = useOrders();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [refundingOrder, setRefundingOrder] = useState<Order | null>(null);
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [deliveryInfoOrder, setDeliveryInfoOrder] = useState<Order | null>(null);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [editableDeliveryData, setEditableDeliveryData] = useState<Record<string, string[]>>({});
  const [manualDeliveryData, setManualDeliveryData] = useState<Record<string, string>>({});
  const [refundReason, setRefundReason] = useState('');
  const { formatPrice } = useCurrency();
  const { categories } = useCategories();
  const { getAvailableStockCount } = useStock();
  const { toast } = useToast();

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.name, c])), [categories]);
  
  const manualItemsInDelivery = useMemo(() => {
    if (!deliveringOrder) return [];
    return deliveringOrder.items.filter(item => {
        const category = categoryMap.get(item.category);
        const isInstant = category?.deliveryMethod === 'instant';
        const isOutOfStock = isInstant && getAvailableStockCount(item.productId) < item.quantity;
        return !isInstant || isOutOfStock;
    });
  }, [deliveringOrder, categoryMap, getAvailableStockCount]);


  const handleOpenCompleteDialog = (order: Order) => {
    const needsManualIntervention = order.items.some(item => {
        const category = categoryMap.get(item.category);
        if (!category) return false;

        const isInstant = category.deliveryMethod === 'instant';
        if (isInstant) {
            const stockCount = getAvailableStockCount(item.productId);
            return stockCount < item.quantity;
        }
        return true; // It's a manual item
    });

    if (needsManualIntervention) {
        setManualDeliveryData({});
        setDeliveringOrder(order);
    } else {
        updateOrderStatus(order.id, 'completed');
        toast({ title: 'Order Completed', description: 'The order has been marked as completed and delivery details have been saved.' });
    }
  };

  const handleManualDeliverySubmit = () => {
    if (!deliveringOrder) return;
    
    const deliveryPayload: Record<string, string[]> = {};
    for (const itemId in manualDeliveryData) {
        if (manualDeliveryData[itemId].trim() !== '') {
            deliveryPayload[itemId] = [manualDeliveryData[itemId]];
        }
    }
    
    updateOrderStatus(deliveringOrder.id, 'completed', undefined, deliveryPayload);
    toast({ title: 'Order Completed', description: 'The order has been marked as completed and delivery details have been saved.' });
    setDeliveringOrder(null);
    setManualDeliveryData({});
  };

  const handleRefundSubmit = () => {
    if (!refundingOrder) return;
    updateOrderStatus(refundingOrder.id, 'refunded', refundReason);
    toast({
        title: 'Order Refunded',
        description: `Order ${refundingOrder.id} has been successfully refunded.`,
    });
    setRefundingOrder(null);
    setRefundReason('');
  };

  const handleOpenDeliveryInfo = (order: Order) => {
    setEditableDeliveryData(order.deliveredItems || {});
    setIsEditingDelivery(false);
    setDeliveryInfoOrder(order);
  };
  
  const handleSaveDeliveryEdits = () => {
    if (!deliveryInfoOrder) return;
    updateDeliveredItems(deliveryInfoOrder.id, editableDeliveryData);
    toast({ title: 'Delivery Info Updated' });
    setIsEditingDelivery(false);
    // Manually update the dialog's state to reflect changes
    setDeliveryInfoOrder(prev => prev ? { ...prev, deliveredItems: { ...editableDeliveryData } } : null);
  };
  
  const subtotal = viewingOrder ? viewingOrder.items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0) : 0;
  
  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "The information has been copied to your clipboard." });
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders.</p>
      </div>

       <AlertDialog open={!!refundingOrder} onOpenChange={(isOpen) => !isOpen && setRefundingOrder(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to refund this order?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will mark the order as refunded and process wallet refunds where applicable. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2 space-y-2">
                <Label htmlFor="refund-reason">Reason for Refund (Optional)</Label>
                <Textarea 
                    id="refund-reason"
                    placeholder="e.g., Customer request, out of stock, etc."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRefundingOrder(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRefundSubmit} className={cn(buttonVariants({ variant: "destructive" }))}>Confirm Refund</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={!!deliveringOrder} onOpenChange={(isOpen) => !isOpen && setDeliveringOrder(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Complete Manual Delivery</DialogTitle>
                <DialogDescription>Enter the delivery information for the items below. This will be visible to the customer.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {manualItemsInDelivery.map(item => (
                    <div key={item.id} className="space-y-2">
                        <Label htmlFor={`delivery-${item.id}`}>{item.name} - ({item.variant.name})</Label>
                        <Textarea
                            id={`delivery-${item.id}`}
                            placeholder={`e.g., Subscription activated, or code XYZ-123`}
                            value={manualDeliveryData[item.id] || ''}
                            onChange={(e) => setManualDeliveryData(prev => ({...prev, [item.id]: e.target.value}))}
                        />
                    </div>
                ))}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={handleManualDeliverySubmit}>Complete Order</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!deliveryInfoOrder} onOpenChange={(isOpen) => !isOpen && setDeliveryInfoOrder(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delivered Information</DialogTitle>
                <DialogDescription>Your delivery information for order {deliveryInfoOrder?.id}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-6 py-4">
                {deliveryInfoOrder?.items.map(item => {
                    const deliveredData = editableDeliveryData?.[item.id];
                    if (!deliveredData || deliveredData.length === 0) return null;

                    return (
                        <div key={item.id} className="space-y-2">
                           <p className="font-semibold">{item.name} <span className="text-muted-foreground">({item.variant.name})</span></p>
                           <div className="space-y-1">
                               {deliveredData.map((data, index) => (
                                   <div key={index} className="flex items-center justify-between gap-2 bg-secondary p-2 rounded-md">
                                        {isEditingDelivery ? (
                                            <Input
                                                value={data}
                                                onChange={(e) => {
                                                    const newData = [...deliveredData];
                                                    newData[index] = e.target.value;
                                                    setEditableDeliveryData(prev => ({...prev, [item.id]: newData }));
                                                }}
                                                className="h-8"
                                            />
                                        ) : (
                                           <>
                                            <code className="text-sm font-mono whitespace-pre-wrap flex-grow">{data}</code>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(data)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                           </>
                                        )}
                                   </div>
                               ))}
                           </div>
                        </div>
                    )
                })}
            </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-between items-center gap-2">
                <div>
                  {isEditingDelivery ? (
                    <Button onClick={handleSaveDeliveryEdits}>Save Changes</Button>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditingDelivery(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <DialogClose asChild>
                    <Button type="button" variant={isEditingDelivery ? "secondary" : "default"}>
                        {isEditingDelivery ? 'Cancel' : 'Close'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>


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
                            <h4 className="font-semibold mb-2">Payment</h4>
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {viewingOrder.discountAmount && viewingOrder.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount ({viewingOrder.appliedCouponCode}):</span>
                                        <span className="text-green-600 dark:text-green-400">- {formatPrice(viewingOrder.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span>{viewingOrder.paymentMethod.name}</span>
                                </div>
                                 <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
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
                            {viewingOrder.status === 'refunded' && viewingOrder.refundedAt && (
                                <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm">
                                    <h4 className="font-semibold text-destructive mb-2">Refund Details</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Refunded On:</span>
                                            <span>{format(new Date(viewingOrder.refundedAt), 'PPp')}</span>
                                        </div>
                                        {viewingOrder.refundReason && (
                                            <div className="flex justify-between items-start text-left">
                                                <span className="text-muted-foreground shrink-0">Reason:</span>
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
        <CardContent className="p-2 md:p-6 md:pt-0">
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
                const hasDeliveredItems = order.status === 'completed' && order.deliveredItems && Object.keys(order.deliveredItems).length > 0;
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
                    <TableCell className="text-right flex items-center justify-end gap-2">
                        {hasDeliveredItems && (
                           <Button variant="outline" size="sm" onClick={() => handleOpenDeliveryInfo(order)}>
                               <KeyRound className="mr-2 h-4 w-4" /> Delivery
                           </Button>
                       )}
                       <Button variant="ghost" size="sm" onClick={() => setViewingOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                       </Button>
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
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleOpenCompleteDialog(order)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'refunded' && (
                             <DropdownMenuItem 
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => {
                                    setRefundReason('');
                                    setRefundingOrder(order);
                                }}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Refund Order
                            </DropdownMenuItem>
                          )}
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
