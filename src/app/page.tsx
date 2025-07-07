
"use client";

import { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/app-header';
import { ProductCard } from '@/components/product-card';
import { Recommendations } from '@/components/recommendations';
import { products } from '@/lib/data';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import Image from 'next/image';
import { useSiteSettings } from '@/hooks/use-site-settings';

const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

export default function Home() {
  const addItemToCart = useCart((state) => state.addItem);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMounted, setIsMounted] = useState(false);
  const { heroImageUrl } = useSiteSettings();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = (product: Product) => {
    addItemToCart(product);
    toast({
      title: "Added to order",
      description: `${product.name} has been added to your order.`,
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
                <h1 className={`text-4xl md:text-6xl font-bold font-headline mb-4 ${animationClass}`}>Your Digital Marketplace</h1>
                <p className={`text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto mb-8 ${animationClass} [animation-delay:200ms]`}>
                    Instant top-ups for your favorite games and digital products. Quick, secure, and reliable service at your fingertips.
                </p>
                <Button size="lg" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className={`${animationClass} [animation-delay:400ms]`}>
                    Browse Products
                </Button>
            </div>
        </section>
        
        <div className="container mx-auto px-4">
            <section id="products" className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center font-headline">Our Products</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {categories.map(category => (
                  <Button 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                    <div key={product.id} className={animationClass} style={{animationDelay: `${400 + index * 100}ms`}}>
                        <ProductCard 
                            product={product} 
                            onAddToCart={() => handleAddToCart(product)}
                        />
                    </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground">No products found. Try adjusting your search or filters.</p>
                )}
            </div>
            </section>

            <section id="recommendations" className="mb-16">
            <Recommendations />
            </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
