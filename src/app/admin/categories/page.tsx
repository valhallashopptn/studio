
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { categories as initialCategories } from '@/lib/data';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Package, Send } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().min(1, 'Image is required'),
  deliveryMethod: z.enum(['manual', 'instant']),
});

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      deliveryMethod: 'manual',
    }
  });
  
  const imageUrl = form.watch('image');

  useEffect(() => {
    setCategories(initialCategories);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      if (editingCategory) {
        form.reset(editingCategory);
      } else {
        form.reset({
          name: '',
          image: 'https://placehold.co/300x200.png',
          deliveryMethod: 'manual',
        });
      }
    }
  }, [editingCategory, isDialogOpen, form]);

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          form.setValue('image', reader.result, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };


  function onSubmit(values: z.infer<typeof categorySchema>) {
    if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...editingCategory, ...values } : c));
    } else {
        const newCategory: Category = {
            id: `cat_${Date.now()}`,
            ...values,
        };
        setCategories(prev => [...prev, newCategory]);
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories.</p>
        </div>
        <Button onClick={handleAddNewClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                <div className="space-y-2">
                    <Label>Category Image Preview</Label>
                    {imageUrl && (
                        <div className="relative aspect-video w-full rounded-md border bg-muted/20">
                            <Image 
                                src={imageUrl} 
                                alt="Category image preview" 
                                fill 
                                className="object-contain rounded-md"
                                unoptimized={imageUrl.startsWith('data:image')}
                            />
                        </div>
                    )}
                </div>

                <FormField control={form.control} name="image" render={() => (
                    <FormItem>
                        <FormLabel>Upload Image</FormLabel>
                        <FormControl>
                            <Input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file:text-primary file:font-semibold"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Delivery Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="manual" /></FormControl>
                          <FormLabel className="font-normal flex items-center gap-2">
                            <Package className="w-4 h-4"/> Manual (e.g., requires admin action)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="instant" /></FormControl>
                          <FormLabel className="font-normal flex items-center gap-2">
                            <Send className="w-4 h-4"/> Instant (delivers a key/code from stock)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>A list of all product categories in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Image src={category.image} alt={category.name} width={40} height={40} className="rounded-md object-cover" unoptimized={category.image.startsWith('data:image')} />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant={category.deliveryMethod === 'instant' ? 'default' : 'secondary'}>
                      {category.deliveryMethod}
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
                        <DropdownMenuItem onClick={() => handleEditClick(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(category.id)}>
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
