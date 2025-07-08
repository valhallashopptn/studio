
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentSettings } from '@/hooks/use-payment-settings';
import type { PaymentMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Landmark, Wallet, CreditCard, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().min(1, 'Icon is required'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  requiresProof: z.boolean(),
});

const icons: { name: string; component: React.ElementType }[] = [
  { name: 'Landmark', component: Landmark },
  { name: 'Wallet', component: Wallet },
  { name: 'CreditCard', component: CreditCard },
];

const IconComponent = ({ name }: { name: string }) => {
  const Icon = icons.find(i => i.name === name)?.component;
  return Icon ? <Icon className="h-5 w-5" /> : null;
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { paymentMethods, addMethod, updateMethod, deleteMethod } = usePaymentSettings();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMethod, setEditingMethod] = React.useState<PaymentMethod | null>(null);

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: '',
      icon: 'Landmark',
      instructions: '',
      requiresProof: false,
    },
  });

  React.useEffect(() => {
    if (editingMethod) {
      form.reset(editingMethod);
    } else {
      form.reset({ name: '', icon: 'Landmark', instructions: '', requiresProof: false });
    }
  }, [editingMethod, form]);

  const handleAddNew = () => {
    setEditingMethod(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsDialogOpen(true);
  };

  const handleDelete = (methodId: string) => {
    deleteMethod(methodId);
    toast({ title: 'Payment Method Deleted' });
  };

  const onSubmit = (values: z.infer<typeof paymentMethodSchema>) => {
    if (editingMethod) {
      updateMethod({ ...editingMethod, ...values });
      toast({ title: 'Payment Method Updated' });
    } else {
      addMethod(values);
      toast({ title: 'Payment Method Added' });
    }
    setIsDialogOpen(false);
    setEditingMethod(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">Manage your manual payment methods.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Method
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? 'Edit' : 'Add'} Payment Method</DialogTitle>
            <DialogDescription>
              Configure the details for this payment method.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bank Transfer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {icons.map(icon => (
                          <SelectItem key={icon.name} value={icon.name}>
                            <div className="flex items-center gap-2">
                              <icon.component className="h-4 w-4" /> {icon.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell customers how to pay..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresProof"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Require Payment Proof?</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Configured Payment Methods</CardTitle>
          <CardDescription>A list of payment methods available at checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Proof Required</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map(method => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <IconComponent name={method.icon} />
                      {method.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.requiresProof ? 'default' : 'secondary'}>
                      {method.requiresProof ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
                      {method.requiresProof ? 'Yes' : 'No'}
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
                        <DropdownMenuItem onClick={() => handleEdit(method)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(method.id)}>
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
