
"use client";

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { CategoryCard } from '@/components/category-card';
import { useCategories } from '@/hooks/use-categories';
import { useTranslation } from '@/hooks/use-translation';

export default function CategoriesPage() {
    const { categories } = useCategories();
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const animationClass = (delay: number) => isMounted ? `opacity-0 animate-fade-in-up [animation-fill-mode:forwards] [animation-delay:${delay}ms]` : 'opacity-0';

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1">
                <section className="bg-primary/10 py-16 text-center overflow-hidden">
                    <div className={`container mx-auto px-4 ${animationClass(0)}`}>
                        <h1 className="text-4xl font-bold font-headline text-primary">{t('categoriesPage.title')}</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t('categoriesPage.subtitle')}
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                            {categories.map((category, index) => (
                                <div key={category.id} className={`aspect-[3/2] ${animationClass(100 + index * 50)}`}>
                                    <CategoryCard category={category} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <AppFooter />
        </div>
    );
}
