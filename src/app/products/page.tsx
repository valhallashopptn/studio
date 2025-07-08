
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';
import { useCategories } from '@/hooks/use-categories';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2 } from 'lucide-react';

function ProductsPageContents() {
  const addItemToCart = useCart((state) => state.addItem);
  const { toast } = useToast();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();

  const categoriesForFilter = useMemo(() => ['All', ...categories.map(c => c.name)], [categories]);

  useEffect(() => {
    setIsMounted(true);
    if (categoryFromUrl && categoriesForFilter.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryFromUrl, categoriesForFilter]);

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0];
    if (!defaultVariant) return;
    addItemToCart(product, defaultVariant, 1);
    toast({
      title: t('cart.addItemToastTitle'),
      description: t('cart.addItemToastDescription', { productName: `${product.name} (${defaultVariant.name})` }),
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const animationClass = isMounted ? 'opacity-0 animate-fade-in-up [animation-fill-mode:forwards]' : 'opacity-0';

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="bg-primary/10 py-16 text-center overflow-hidden">
            <div className={`container mx-auto px-4 ${animationClass}`}>
                <h1 className="text-4xl font-bold font-headline text-primary">{t('productsPage.title')}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('productsPage.subtitle')}
                </p>
            </div>
        </section>

        <section id="products" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder={t('home.searchPlaceholder')}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {categoriesForFilter.map(category => (
                  <Button 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'All' ? t('home.all') : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                    <div key={product.id} className={animationClass} style={{animationDelay: `${index * 50}ms`}}>
                        <ProductCard 
                            product={product} 
                            onAddToCart={() => handleAddToCart(product)}
                        />
                    </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground">{t('home.noProductsFound')}</p>
                )}
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}


export default function ProductsPage() {
    return (
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
            <ProductsPageContents />
        </Suspense>
    )
}
