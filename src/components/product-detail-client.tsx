"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingCart, Star, Minus, Plus, UserCheck, PackageCheck, Zap, CheckCircle } from 'lucide-react';

import type { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import { useReviews } from '@/hooks/use-reviews';
import { useCategories } from '@/hooks/use-categories';
import { useStock } from '@/hooks/use-stock';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const { addItem, checkoutItem } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { reviews } = useReviews();
  const { categories } = useCategories();
  const { getAvailableStockCount } = useStock();

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const sortedVariants = [...product.variants].sort((a, b) => a.price - b.price);
      setSelectedVariant(sortedVariants[0]);
    }
  }, [product]);

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
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    toast({
      title: t('cart.addItemToastTitle'),
      description: `${quantity} x ${product.name} (${selectedVariant.name}) has been added to your order.`,
    });
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    checkoutItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  return (
    <>
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
                        ? `${averageRating.toFixed(1)} (${t('productPage.reviews', { count: productReviews.length })})`
                        : t('productPage.noReviews')
                    }
                </span>
            </div>

          <p className="text-3xl font-bold text-primary">{selectedVariant ? formatPrice(selectedVariant.price) : '...'}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          {product.variants.length > 1 && (
            <div>
              <Label className="font-semibold mb-2 block">Select Version</Label>
              <RadioGroup 
                value={selectedVariant?.id} 
                onValueChange={(variantId) => {
                  const newVariant = product.variants.find(v => v.id === variantId);
                  if (newVariant) setSelectedVariant(newVariant);
                }}
                className="grid grid-cols-2 gap-2"
              >
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <Label key={variant.id} htmlFor={variant.id} className={cn(
                      "relative flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "border-muted bg-popover hover:bg-accent/10"
                    )}>
                        <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" />
                        <span className="font-semibold">{variant.name}</span>
                        <span className="text-sm">{formatPrice(variant.price)}</span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                    </Label>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          <Card className="bg-secondary/50">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    {category?.deliveryMethod === 'instant' ? (
                      <Zap className="h-6 w-6 text-primary" />
                    ) : (
                      <UserCheck className="h-6 w-6 text-primary" />
                    )}
                    <div>
                        <p className="font-semibold">{t('productPage.deliveryMethod')}</p>
                        <p className="text-sm text-muted-foreground capitalize">{category?.deliveryMethod === 'instant' ? t('productPage.instantDelivery') : t('productPage.manualProcessing')}</p>
                    </div>
                </div>
                {category?.deliveryMethod === 'instant' && (
                    <div className="flex items-center gap-3">
                        <PackageCheck className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">{t('productPage.inStock')}</p>
                            <p className="text-sm text-muted-foreground">{stockCount} {t('productPage.available')}</p>
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
              <div className="flex items-center gap-2 flex-1">
                <Button size="lg" className="flex-1 h-12" onClick={handleAddToCart} disabled={!selectedVariant}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t('productCard.addToOrder')}
                </Button>
                <Button variant="secondary" size="lg" className="flex-1 h-12" onClick={handleBuyNow} disabled={!selectedVariant}>
                  <Zap className="mr-2 h-5 w-5" />
                  {t('productPage.buyNow')}
                </Button>
              </div>
          </div>

        </div>
      </div>
      
      <div className="w-full mt-16">
        <Tabs defaultValue={product.details[0]?.title || 'reviews'} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden border-b bg-transparent p-0 rounded-none">
              {product.details.map((detail, index) => (
                <TabsTrigger 
                    key={index} 
                    value={detail.title} 
                    className="flex-shrink-0 rounded-none border-b-2 border-transparent bg-transparent p-4 font-semibold text-muted-foreground shadow-none transition-colors hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                    {detail.title}
                </TabsTrigger>
              ))}
              <TabsTrigger 
                value="reviews" 
                className="flex-shrink-0 rounded-none border-b-2 border-transparent bg-transparent p-4 font-semibold text-muted-foreground shadow-none transition-colors hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
                {t('productPage.reviewsTab', { count: productReviews.length })}
            </TabsTrigger>
          </TabsList>

          {product.details.map((detail, index) => (
            <TabsContent key={index} value={detail.title} className="mt-0">
              <Card className="border-t-0 rounded-t-none">
                <CardContent className="p-6">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{detail.content}</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          <TabsContent value="reviews" className="mt-0">
            <Card className="border-t-0 rounded-t-none">
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
                  <p className="text-muted-foreground text-center">{t('productPage.noReviewsForProduct')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}