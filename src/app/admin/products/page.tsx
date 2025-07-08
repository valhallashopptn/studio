
'use client';

import { useState, useEffect } from 'react';
import { products as initialProducts } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Sparkles, Loader2, X, Plus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/use-currency';
import { useCategories } from '@/hooks/use-categories';
import { Separator } from '@/components/ui/separator';

const productDetailSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().min(1, 'Image is required').refine(val => val.startsWith('https://') || val.startsWith('data:image'), {
    message: "Must be a valid URL or a generated data URI",
  }),
  aiHint: z.string().min(1, 'AI Hint is required'),
  details: z.array(productDetailSchema).default([]),
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { categories } = useCategories();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { formatPrice } = useCurrency();
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details"
  });

  const imageUrl = form.watch('image');

  useEffect(() => {
    setProducts(initialProducts);
    setIsMounted(true);
  }, []);

   useEffect(() => {
    if (isDialogOpen) {
      if (editingProduct) {
        form.reset(editingProduct);
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          category: categories.length > 0 ? categories[0].name : '',
          image: 'https://placehold.co/600x400.png',
          aiHint: '',
          details: [],
        });
      }
    }
  }, [editingProduct, isDialogOpen, form, categories]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleGenerateImage = async () => {
    const hint = form.getValues('aiHint');
    if (!hint) {
      form.setError('aiHint', { type: 'manual', message: 'Please provide an AI hint to generate an image.' });
      return;
    }
    setIsGeneratingImage(true);
    form.clearErrors('image');
    try {
      const result = await generateImage({ prompt: `a professional product shot for an online store: ${hint}` });
      form.setValue('image', result.imageDataUri, { shouldValidate: true });
    } catch (error) {
      console.error('Image generation failed:', error);
      form.setError('image', { type: 'manual', message: 'AI image generation failed. Please try again.' });
    } finally {
      setIsGeneratingImage(false);
    }
  };


  function onSubmit(values: z.infer<typeof productSchema>) {
    if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...editingProduct, ...values } : p));
    } else {
        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            ...values,
        };
        setProducts(prev => [...prev, newProduct]);
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your products here.</p>
        </div>
        <Button onClick={handleAddNewClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
              <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price (USD)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage /></FormItem>
                )}/>

                <FormField control={form.control} name="aiHint" render={({ field }) => (
                    <FormItem><FormLabel>AI Hint for Image Generation</FormLabel><FormControl><Input placeholder="e.g. 'stack of gold coins for a game'" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                <div className="space-y-2">
                    <Label>Product Image Preview</Label>
                    {imageUrl && (
                        <div className="relative aspect-video w-full rounded-md border bg-muted/20">
                            <Image 
                                src={imageUrl} 
                                alt="Product image preview" 
                                fill 
                                className="object-contain rounded-md"
                                unoptimized={imageUrl.startsWith('http')}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="imageUrl">Image URL or Generate</Label>
                    <div className="flex gap-2">
                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                    <Input id="imageUrl" placeholder="Enter URL or generate one" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage} variant="secondary">
                            {isGeneratingImage ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        </Button>
                    </div>
                </div>

                <Separator />
                <div className="space-y-4">
                    <Label>Product Details & Notes</Label>
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-lg space-y-3 relative">
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}><X className="h-4 w-4"/></Button>
                            <FormField
                                control={form.control}
                                name={`details.${index}.title`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl><Input placeholder="e.g. How It Works" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`details.${index}.content`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl><Textarea placeholder="Describe the details..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ title: '', content: '' })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Detail Section
                    </Button>
                </div>
              </form>
          </Form>
           <DialogFooter className="pt-4 border-t">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" form="product-form">Save changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>A list of all products in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
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
