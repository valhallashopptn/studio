
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import { Recommendations } from '@/components/recommendations';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const addItemToCart = useCart((state) => state.addItem);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
    setIsLoading(false);
  }, [id]);

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
                            <Skeleton className="h-10 w-40 rounded-md" />
                            <Skeleton className="h-20 w-full rounded-md" />
                            <Skeleton className="h-12 w-48 rounded-md" />
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

  const handleAddToCart = () => {
    addItemToCart(product);
    toast({
      title: t('cart.addItemToastTitle'),
      description: t('cart.addItemToastDescription', { productName: product.name }),
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image Column */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.aiHint}
              />
            </div>
            
            {/* Details Column */}
            <div className="space-y-6">
              <Badge variant="secondary">{product.category}</Badge>
              <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
              <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <Button size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t('productCard.addToOrder')}
              </Button>
            </div>
          </div>

          <Separator className="my-16" />

          <Recommendations />

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
