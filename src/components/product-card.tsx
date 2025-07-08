
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/hooks/use-currency';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop the link from navigating
    onAddToCart();
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full hover:border-primary/50 group relative">
      {/* The link overlay makes the entire card clickable */}
      <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={`View details for ${product.name}`} />
      
      {/* All content sits above the link conceptually */}
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg mb-2 group-hover:text-primary transition-colors">{product.name}</CardTitle>
            <Badge variant="secondary" className="flex items-center">
              {product.category}
            </Badge>
        </div>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative aspect-video w-full">
            <Image
            src={product.image}
            alt={product.name}
            fill
            className="rounded-md object-cover"
            data-ai-hint={product.aiHint}
            />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto pt-4 relative z-20">
        {isMounted ? (
            <p className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
            </p>
        ) : (
            <Skeleton className="h-7 w-24" />
        )}
        <Button onClick={handleButtonClick} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('productCard.addToOrder')}
        </Button>
      </CardFooter>
    </Card>
  );
}
