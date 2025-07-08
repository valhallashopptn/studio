
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';

import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingCart, Star, Minus, Plus, Truck, PackageCheck } from 'lucide-react';

import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import { useReviews } from '@/hooks/use-reviews';
import { useCategories } from '@/hooks/use-categories';
import { useStock } from '@/hooks/use-stock';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const addItemToCart = useCart((state) => state.addItem);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { reviews } = useReviews();
  const { categories } = useCategories();
  const { getAvailableStockCount } = useStock();

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
    setIsLoading(false);
  }, [id]);

  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter(r => r.product === product.name);
  }, [reviews, product]);

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return total / productReviews.length;
  }, [productReviews]);

  const category = useMemo(() => {
    if (!product) return null;
    return categories.find(c => c.name === product.category);
  }, [categories, product]);

  const stockCount = useMemo(() => {
    if (!product || !category || category.deliveryMethod !== 'instant') return null;
    return getAvailableStockCount(product.id);
  }, [product, category, getAvailableStockCount]);

  const handleAddToCart = () => {
    if (!product) return;
    addItemToCart(product, quantity);
    toast({
      title: t('cart.addItemToastTitle'),
      description: `${quantity} x ${product.name} has been added to your order.`,
    });
  };

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <div className="space-y-6">
                            <Skeleton className="h-6 w-24 rounded-md" />
                            <Skeleton className="h-12 w-3/4 rounded-md" />
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-10 w-40 rounded-md" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-12 w-full rounded-md" />
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
  }
  
  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.aiHint}
              />
            </div>
            
            <div className="space-y-6">
              <Badge variant="secondary">{product.category}</Badge>
              <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
              
               <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} />
                        ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                        {productReviews.length > 0
                            ? `${averageRating.toFixed(1)} (${productReviews.length} reviews)`
                            : 'No reviews yet'
                        }
                    </span>
                </div>

              <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              
              <Card className="bg-secondary/50">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Truck className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">Delivery Method</p>
                            <p className="text-sm text-muted-foreground capitalize">{category?.deliveryMethod === 'instant' ? 'Instant Delivery' : 'Manual Processing'}</p>
                        </div>
                    </div>
                    {category?.deliveryMethod === 'instant' && (
                        <div className="flex items-center gap-3">
                            <PackageCheck className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">In Stock</p>
                                <p className="text-sm text-muted-foreground">{stockCount} available</p>
                            </div>
                        </div>
                    )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                    <Input type="number" value={quantity} readOnly className="h-12 w-16 text-center text-lg font-bold" />
                    <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <Button size="lg" className="flex-1 h-12" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t('productCard.addToOrder')}
                  </Button>
              </div>

            </div>
          </div>
          
          <div className="w-full mt-16">
            <Tabs defaultValue={product.details[0]?.title || 'reviews'}>
              <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
                 {product.details.map((detail, index) => (
                    <TabsTrigger key={index} value={detail.title} className="flex-shrink-0">{detail.title}</TabsTrigger>
                 ))}
                 <TabsTrigger value="reviews" className="flex-shrink-0">Reviews ({productReviews.length})</TabsTrigger>
              </TabsList>

              {product.details.map((detail, index) => (
                <TabsContent key={index} value={detail.title}>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{detail.content}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}

              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6">
                    {productReviews.length > 0 ? (
                      <div className="space-y-6">
                        {productReviews.map(review => (
                          <div key={review.id} className="flex gap-4">
                            <Avatar>
                              <AvatarImage src={review.avatar} alt={review.name} />
                              <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{review.name}</h4>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 italic">"{review.text}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">No reviews for this product yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
