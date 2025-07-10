
'use client';

import { useState, useEffect, useMemo } from 'react';
import type React from 'react';
import { useStock } from '@/hooks/use-stock';
import { products as initialProducts } from '@/lib/data';
import { useCategories } from '@/hooks/use-categories';
import type { Product, StockItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminStockPage() {
  const { stock, getAvailableStockCount, getStockForProduct, addStockItems, deleteStockItem } = useStock();
  const { categories } = useCategories();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStockData, setNewStockData] = useState('');
  const { toast } = useToast();

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.name, c])), [categories]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleManageStock = (product: Product) => {
    setSelectedProduct(product);
    setNewStockData('');
    setIsDialogOpen(true);
  };
  
  const handleAddStock = () => {
    if (!selectedProduct || !newStockData.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter at least one item.",
        });
        return;
    }
    
    const dataArray = newStockData.split('\n').filter(line => line.trim() !== '');

    addStockItems(selectedProduct.id, dataArray);
    
    toast({
        title: "Stock Added",
        description: `${dataArray.length} new item(s) added for ${selectedProduct.name}.`,
    });
    
    setNewStockData('');
  };

  const handleDeleteStockItem = (itemId: string) => {
    deleteStockItem(itemId);
    toast({ title: "Stock Item Deleted" });
  };

  const productStock = selectedProduct ? getStockForProduct(selectedProduct.id) : [];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground">Manage keys, codes, or account data for your instant delivery products.</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Stock for: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>View existing stock or add new items below.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Add New Stock</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="new-stock-data">New Stock (one item per line)</Label>
                            <Textarea 
                                id="new-stock-data"
                                value={newStockData}
                                onChange={(e) => setNewStockData(e.target.value)}
                                rows={8}
                                placeholder={'CODE-1234-ABCD\nusername:password\nanother-code'}
                            />
                             <p className="text-xs text-muted-foreground mt-2">
                                Paste your codes, account details, or other data here. Each line will become a single stock item.
                            </p>
                        </div>
                        <Button onClick={handleAddStock}>Add to Stock</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
               <Card>
                    <CardHeader><CardTitle>Existing Stock ({productStock.length})</CardTitle></CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Used</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productStock.length > 0 ? productStock.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs">
                                                {item.data}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.isUsed ? 'default' : 'secondary'}>
                                                    {item.isUsed ? 'Yes' : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs">{format(new Date(item.addedAt), 'P')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8"
                                                    onClick={() => handleDeleteStockItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No stock found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
               </Card>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Product Stock Overview</CardTitle>
          <CardDescription>View available stock counts for all products.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Delivery Method</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialProducts.map((product) => {
                const category = categoryMap.get(product.category);
                const deliveryMethod = category?.deliveryMethod || 'manual';

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                        <Badge variant={deliveryMethod === 'instant' ? 'default' : 'secondary'}>
                            {deliveryMethod}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {deliveryMethod === 'instant' ? getAvailableStockCount(product.id) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {deliveryMethod === 'instant' && (
                        <Button variant="outline" size="sm" onClick={() => handleManageStock(product)}>
                          Manage Stock
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
            })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
