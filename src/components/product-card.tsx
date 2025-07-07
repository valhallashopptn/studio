
"use client"

import Image from 'next/image';
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

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full hover:border-primary/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg mb-2">{product.name}</CardTitle>
            <Badge variant="secondary" className="flex items-center">
              {product.category}
            </Badge>
        </div>
        <CardDescription>{product.description}</CardDescription>
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
      <CardFooter className="flex justify-between items-center">
        <p className="text-xl font-bold text-primary">
          ${product.price.toFixed(2)}
        </p>
        <Button onClick={onAddToCart} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('productCard.addToOrder')}
        </Button>
      </CardFooter>
    </Card>
  );
}
