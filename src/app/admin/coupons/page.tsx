
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { useCoupons } from '@/hooks/use-coupons';
import type { Coupon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Gift, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters.').max(20, 'Code must be 20 characters or less.'),
  discountType: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0.01, "Value must be greater than 0."),
  usageLimit: z.coerce.number().min(1, "Usage limit must be at least 1."),
  expiresAt: z.date().optional(),
  firstPurchaseOnly: z.boolean().optional(),
});


export default function AdminCouponsPage() {
  const { coupons, addCoupon, deleteCoupon } = useCoupons();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discountType: 'percentage',
      usageLimit: 100,
      firstPurchaseOnly: false,
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleDelete = (couponId: string) => {
    deleteCoupon(couponId);
    toast({ title: 'Coupon Deleted', description: 'The coupon has been removed.' });
  };
  
  const generateRandomCode = () => {
    const randomCode = `SALE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    form.setValue('code', randomCode);
  };

  function onSubmit(values: z.infer<typeof couponSchema>) {
    const newCode = addCoupon({
        ...values,
        expiresAt: values.expiresAt?.toISOString(),
        firstPurchaseOnly: values.firstPurchaseOnly || false,
    });
    toast({
        title: "Coupon Created!",
        description: `Coupon code "${newCode}" has been successfully created.`,
    });
    setIsDialogOpen(false);
  }
  
  const handleAddNewClick = () => {
    form.reset({
        code: '',
        discountType: 'percentage',
        value: 10,
        usageLimit: 100,
        expiresAt: undefined,
        firstPurchaseOnly: false,
    });
    setIsDialogOpen(true);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage your promotional coupons.</p>
        </div>
        <Button onClick={handleAddNewClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
            <DialogDescription>Fill in the details to create a new promotional coupon.</DialogDescription>
          </DialogHeader>
            <Form {...form}>
              <form id="coupon-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Coupon Code</FormLabel>
                        <div className="flex gap-2">
                           <FormControl><Input placeholder="e.g. SUMMER25" {...field} /></FormControl>
                           <Button type="button" variant="outline" size="icon" onClick={generateRandomCode}><Wand2/></Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="discountType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="value" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 10" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="usageLimit" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Usage Limit</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 100" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="expiresAt" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Expiry Date (Optional)</FormLabel>
                             <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                 <FormField
                    control={form.control}
                    name="firstPurchaseOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>First Purchase Only</FormLabel>
                          <FormDescription>
                            If checked, this coupon can only be used by new customers.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

              </form>
            </Form>
          <DialogFooter className="pt-4 border-t">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" form="coupon-form">Create Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Coupon List</CardTitle>
          <CardDescription>A list of all active and past coupons.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono">{coupon.code}</TableCell>
                   <TableCell className="capitalize">{coupon.discountType}</TableCell>
                   <TableCell className="font-semibold">
                    {coupon.discountType === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                   </TableCell>
                  <TableCell>{coupon.timesUsed} / {coupon.usageLimit}</TableCell>
                  <TableCell>
                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'P') : 'Never'}
                  </TableCell>
                  <TableCell>
                    {coupon.firstPurchaseOnly && <Badge variant="outline">First Purchase</Badge>}
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
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
