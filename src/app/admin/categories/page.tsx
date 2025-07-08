
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { useCategories } from '@/hooks/use-categories';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Package, Send, Plus, X } from 'lucide-react';
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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  name: z.string().min(1, "Name is required").regex(/^[a-z0-9_]+$/, "Name can only contain lowercase letters, numbers, and underscores."),
  type: z.enum(['text', 'email', 'number']),
  placeholder: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image: z.string().min(1, 'Front image is required'),
  backImage: z.string().min(1, 'Back image is required'),
  deliveryMethod: z.enum(['manual', 'instant']),
  customFields: z.array(customFieldSchema).optional(),
});

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      deliveryMethod: 'manual',
      customFields: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields"
  });
  
  const imageUrl = form.watch('image');
  const backImageUrl = form.watch('backImage');
  const deliveryMethod = form.watch('deliveryMethod');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      if (editingCategory) {
        form.reset({
            ...editingCategory,
            customFields: editingCategory.customFields || [],
        });
      } else {
        form.reset({
          name: '',
          description: '',
          image: 'https://placehold.co/300x200.png',
          backImage: 'https://placehold.co/300x200.png',
          deliveryMethod: 'manual',
          customFields: [],
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
    deleteCategory(categoryId);
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

  const handleBackImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          form.setValue('backImage', reader.result, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };


  function onSubmit(values: z.infer<typeof categorySchema>) {
    if (editingCategory) {
        updateCategory({ ...editingCategory, ...values });
    } else {
        addCategory(values);
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto -mx-6 px-6 pr-2">
            <Form {...form}>
              <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                    <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea placeholder="Details about the category for the card back..." {...field} rows={3}/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <Separator />

                        <div className="space-y-2">
                            <Label>Front Image Preview</Label>
                            {imageUrl && (
                                <div className="relative aspect-video w-full rounded-md border bg-muted/20">
                                    <Image 
                                        src={imageUrl} 
                                        alt="Category front image preview" 
                                        fill 
                                        className="object-contain rounded-md"
                                        unoptimized={imageUrl.startsWith('data:image')}
                                    />
                                </div>
                            )}
                        </div>

                        <FormField control={form.control} name="image" render={() => (
                            <FormItem>
                                <FormLabel>Upload Front Image</FormLabel>
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
                        
                        <Separator />

                        <div className="space-y-2">
                            <Label>Back Image Preview</Label>
                            {backImageUrl && (
                                <div className="relative aspect-video w-full rounded-md border bg-muted/20">
                                    <Image 
                                        src={backImageUrl} 
                                        alt="Category back image preview" 
                                        fill 
                                        className="object-contain rounded-md"
                                        unoptimized={backImageUrl.startsWith('data:image')}
                                    />
                                </div>
                            )}
                        </div>

                        <FormField control={form.control} name="backImage" render={() => (
                            <FormItem>
                                <FormLabel>Upload Back Image</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBackImageFileChange}
                                        className="file:text-primary file:font-semibold"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    
                    <div className="space-y-4">
                        <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Delivery Method</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0 p-2 border rounded-md has-[:checked]:bg-secondary">
                                  <FormControl><RadioGroupItem value="manual" /></FormControl>
                                  <FormLabel className="font-normal flex items-center gap-2">
                                    <Package className="w-4 h-4"/> Manual (requires admin action)
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-2 border rounded-md has-[:checked]:bg-secondary">
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

                      {deliveryMethod === 'manual' && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <Label>Custom Order Fields</Label>
                                <p className="text-sm text-muted-foreground">Add fields to collect required information from the customer at checkout.</p>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-3 border rounded-lg space-y-3 relative">
                                        <FormField control={form.control} name={`customFields.${index}.label`} render={({ field }) => (
                                            <FormItem><FormLabel>Field Label</FormLabel><FormControl><Input placeholder="e.g., In-Game User ID" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField control={form.control} name={`customFields.${index}.name`} render={({ field }) => (
                                                <FormItem><FormLabel>Field Name</FormLabel><FormControl><Input placeholder="e.g., user_id" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name={`customFields.${index}.type`} render={({ field }) => (
                                                <FormItem><FormLabel>Field Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text</SelectItem>
                                                        <SelectItem value="email">Email</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                    </SelectContent>
                                                </Select><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                        <FormField control={form.control} name={`customFields.${index}.placeholder`} render={({ field }) => (
                                            <FormItem><FormLabel>Placeholder</FormLabel><FormControl><Input placeholder="e.g., Enter your User ID" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}><X className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `field_${Date.now()}`, label: '', name: '', type: 'text', placeholder: '' })}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Field
                                </Button>
                            </div>
                        </>
                      )}
                    </div>
                </div>
              </form>
            </Form>
          </div>
          <DialogFooter className="pt-4 border-t flex-shrink-0">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" form="category-form">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>A list of all product categories in your store.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
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
