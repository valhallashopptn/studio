
'use client';

import { useState, useEffect, useMemo } from 'react';
import type React from 'react';
import { useStock } from '@/hooks/use-stock';
import { products as initialProducts, categories as initialCategories } from '@/lib/data';
import type { Product, StockItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
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
  const { stock, getAvailableStockCount, getStockForProduct, addStockItems } = useStock();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newCodes, setNewCodes] = useState('');
  const { toast } = useToast();

  const categoryMap = useMemo(() => new Map(initialCategories.map(c => [c.name, c])), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleManageStock = (product: Product) => {
    setSelectedProduct(product);
    setNewCodes('');
    setIsDialogOpen(true);
  };
  
  const handleAddStock = () => {
    if (!selectedProduct || !newCodes.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter at least one code.",
        });
        return;
    }
    
    const codesArray = newCodes.split('\n').filter(code => code.trim() !== '');
    addStockItems(selectedProduct.id, codesArray);
    
    toast({
        title: "Stock Added",
        description: `${codesArray.length} new code(s) added for ${selectedProduct.name}.`,
    });
    
    setNewCodes('');
  };

  const productStock = selectedProduct ? getStockForProduct(selectedProduct.id) : [];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground">Manage keys and codes for your instant delivery products.</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Stock for: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>View existing stock or add new codes below.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Add New Codes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="new-codes">New Codes (one per line)</Label>
                            <Textarea 
                                id="new-codes"
                                value={newCodes}
                                onChange={(e) => setNewCodes(e.target.value)}
                                rows={8}
                                placeholder="CODE-1234-ABCD&#10;CODE-5678-EFGH&#10;..."
                            />
                        </div>
                        <Button onClick={handleAddStock}>Add to Stock</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
               <Card>
                    <CardHeader><CardTitle>Existing Stock</CardTitle></CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Used</TableHead>
                                        <TableHead>Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productStock.length > 0 ? productStock.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs">{item.code}</TableCell>
                                            <TableCell>
                                                {item.isUsed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                            </TableCell>
                                            <TableCell className="text-xs">{format(new Date(item.addedAt), 'P')}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">No stock found.</TableCell>
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
        <CardContent>
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
