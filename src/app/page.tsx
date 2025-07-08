
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { ProductCard } from '@/components/product-card';
import { CategoryCard } from '@/components/category-card';
import { products } from '@/lib/data';
import { useCategories } from '@/hooks/use-categories';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import Image from 'next/image';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Reviews } from '@/components/reviews';
import { useTranslation } from '@/hooks/use-translation';
import { StatsSection } from '@/components/stats-section';

export default function Home() {
  const addItemToCart = useCart((state) => state.addItem);
  const { toast } = useToast();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMounted, setIsMounted] = useState(false);
  const { heroImageUrl } = useSiteSettings();
  const { t } = useTranslation();

  const categoriesForFilter = useMemo(() => ['All', ...categories.map(c => c.name)], [categories]);
  const categoriesToShow = useMemo(() => categories.slice(0, 8), [categories]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = (product: Product) => {
    addItemToCart(product);
    toast({
      title: t('cart.addItemToastTitle'),
      description: t('cart.addItemToastDescription', { productName: product.name }),
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const productsToShow = filteredProducts.slice(0, 12);

  const animationClass = isMounted ? 'opacity-0 animate-fade-in-up [animation-fill-mode:forwards]' : 'opacity-0';
  
  const isVideo = heroImageUrl && heroImageUrl.endsWith('.mp4');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="relative py-20 mb-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
                 {isVideo ? (
                    <video
                        src={heroImageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="object-cover w-full h-full"
                    />
                 ) : (
                    <Image
                        src={heroImageUrl}
                        alt="Gaming background"
                        fill
                        priority
                        className="object-cover animate-slow-pan"
                        data-ai-hint="gaming background"
                        unoptimized={heroImageUrl.startsWith('data:image')}
                    />
                 )}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
            </div>
            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className={`text-4xl md:text-6xl font-bold font-headline mb-4 ${animationClass}`}>{t('home.heroTitle')}</h1>
                <p className={`text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto mb-8 ${animationClass} [animation-delay:200ms]`}>
                    {t('home.heroSubtitle')}
                </p>
                <Button size="lg" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className={`${animationClass} [animation-delay:400ms]`}>
                    {t('home.browseProducts')}
                </Button>
            </div>
        </section>
        
        <div className="container mx-auto px-4">
            <section id="categories" className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center font-headline">{t('home.ourCategories')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {categoriesToShow.map((category, index) => (
                  <div key={category.id} className={`${animationClass} aspect-video`} style={{animationDelay: `${200 + index * 100}ms`}}>
                    <CategoryCard 
                      category={category}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Button asChild size="lg" variant="outline">
                  <Link href="/categories">
                    {t('home.viewAllCategories')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </section>
            
            <section id="products" className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center font-headline">{t('home.ourProducts')}</h2>

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
                {productsToShow.length > 0 ? (
                    productsToShow.map((product, index) => (
                    <div key={product.id} className={animationClass} style={{animationDelay: `${400 + index * 100}ms`}}>
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
            
            <div className="mt-12 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/products">
                  {t('home.viewAllProducts')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            </section>
        </div>
        
        <StatsSection />

        <Reviews />

      </main>
      <AppFooter />
    </div>
  );
}
