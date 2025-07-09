
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { BadgeCheck, Coins, Gem, GitBranch, Image as ImageIcon, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { useCurrency, CONVERSION_RATES } from '@/hooks/use-currency';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';


const features = [
  { icon: Gem, titleKey: 'premiumPage.feature1Title', descriptionKey: 'premiumPage.feature1Desc' },
  { icon: ImageIcon, titleKey: 'premiumPage.feature2Title', descriptionKey: 'premiumPage.feature2Desc' },
  { icon: Zap, titleKey: 'premiumPage.feature3Title', descriptionKey: 'premiumPage.feature3Desc' },
  { icon: Coins, titleKey: 'premiumPage.feature4Title', descriptionKey: 'premiumPage.feature4Desc' },
  { icon: BadgeCheck, titleKey: 'premiumPage.feature5Title', descriptionKey: 'premiumPage.feature5Desc' },
  { icon: GitBranch, titleKey: 'premiumPage.feature6Title', descriptionKey: 'premiumPage.feature6Desc' },
];

const premiumPriceTND = 10;
const premiumPriceUSD = premiumPriceTND / CONVERSION_RATES.TND;

export default function PremiumPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isPremium } = useAuth();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated || isAdmin) {
        router.push('/');
      }
    }
  }, [isMounted, isAuthenticated, isAdmin, router]);

  const priceText = `${premiumPriceTND.toFixed(0)} TND / ${t('premiumPage.month')}`;

  if (!isMounted || !isAuthenticated || isAdmin) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (isPremium) {
     return (
      <div className="flex flex-col min-h-screen bg-secondary/30">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center text-center p-4">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><CheckCircle className="h-8 w-8 text-green-500" /> {t('premiumPage.alreadyPremiumTitle')}</CardTitle>
                    <CardDescription>{t('premiumPage.alreadyPremiumDesc')}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard/settings')} className="w-full">{t('premiumPage.goToDashboard')}</Button>
                </CardFooter>
            </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  const handleUpgrade = () => {
    if (!user) return;

    // A "virtual" product that only exists for the checkout flow
    const premiumProduct: Product = {
      id: 'premium-membership-product',
      name: t('premiumPage.productName'),
      description: t('premiumPage.productDescription'),
      variants: [{ id: 'monthly', name: t('premiumPage.month'), price: premiumPriceUSD }],
      image: 'https://placehold.co/128x128.png', // A placeholder for the cart
      category: 'Digital',
      aiHint: 'premium membership gem',
      details: [],
    };
    const premiumVariant = premiumProduct.variants[0];

    addItem(premiumProduct, premiumVariant, 1);
    router.push('/checkout');
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400 bg-clip-text text-transparent">{t('premiumPage.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('premiumPage.subtitle')}</p>
          </div>
          
          <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl border-primary/20">
            <CardHeader className="p-8 bg-background">
              <CardTitle className="text-3xl">{t('premiumPage.cardTitle')}</CardTitle>
              <CardDescription>{t('premiumPage.cardDescMonthly')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{t(feature.titleKey)}</h3>
                                    <p className="text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter className="p-8 bg-background border-t">
                <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-2xl font-bold">{priceText}</p>
                     <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" onClick={handleUpgrade}>
                        <Gem className="mr-2" />
                        {t('premiumPage.upgradeButton')}
                    </Button>
                </div>
            </CardFooter>
          </Card>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
