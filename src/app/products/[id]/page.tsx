
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ProductDetailClient } from '@/components/product-detail-client';
import { useProducts } from '@/hooks/use-products';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function ProductDetailPage() {
  const { products, isLoading } = useProducts();
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
    }
  }, [id, products, isLoading]);
  
  if (product === undefined || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <AppFooter />
      </div>
    );
  }

  if (product === null) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
            <ProductDetailClient product={product} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
