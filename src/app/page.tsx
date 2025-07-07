"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { ProductCard } from '@/components/product-card';
import { Recommendations } from '@/components/recommendations';
import { products } from '@/lib/data';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/lib/types';
import { Gamepad2, Gift } from 'lucide-react';

export default function Home() {
  const [isCartOpen, setCartOpen] = useState(false);
  const addItemToCart = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addItemToCart(product);
    toast({
      title: "Added to order",
      description: `${product.name} has been added to your order.`,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onCartClick={() => setCartOpen(true)} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section id="products" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center font-headline">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </section>

        <section id="recommendations" className="mb-16">
           <Recommendations />
        </section>
      </main>
      <footer className="py-6 bg-secondary text-secondary-foreground text-center text-sm">
        <p>&copy; {new Date().getFullYear()} TopUp Hub. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
