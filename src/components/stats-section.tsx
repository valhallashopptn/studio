
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, LifeBuoy } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const Counter = ({ target, suffix = '', duration = 2000 }: { target: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    // Animate over approx. duration, firing every frame
    const increment = end / (duration / 16); 

    const counter = () => {
      start += increment;
      if (start < end) {
        setCount(Math.ceil(start));
        requestAnimationFrame(counter);
      } else {
        setCount(end);
      }
    };

    const animFrame = requestAnimationFrame(counter);

    return () => cancelAnimationFrame(animFrame);
  }, [target, duration]);

  return <>{count}{suffix}</>;
};


export function StatsSection() {
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);
    const animationClass = (delay: number) => isMounted ? `opacity-0 animate-fade-in-up [animation-fill-mode:forwards] [animation-delay:${delay}ms]` : 'opacity-0';
    
    const stats = [
      {
        icon: Package,
        title: t('statsSection.productsLive'),
        target: 120,
        suffix: '+',
      },
      {
        icon: ShoppingCart,
        title: t('statsSection.transactionsCompleted'),
        target: 15,
        suffix: 'k+',
      },
      {
        icon: LifeBuoy,
        title: t('statsSection.dedicatedSupport'),
        target: 24,
        suffix: '/7',
        isStaticText: true,
      },
    ];


  return (
    <section className="bg-secondary/30 py-16 my-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.title} className={animationClass(index * 200)}>
                <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
                <CardHeader className="flex flex-col items-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">
                    {stat.isStaticText ? `${stat.target}${stat.suffix}` : <Counter target={stat.target} suffix={stat.suffix} />}
                    </p>
                </CardContent>
                </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
