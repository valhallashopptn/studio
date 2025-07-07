
"use client"
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AppFooter } from '@/components/app-footer';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useTranslation } from '@/hooks/use-translation';

export default function AboutPage() {
    const { siteTitle } = useSiteSettings();
    const { t } = useTranslation();
    const [year, setYear] = useState(new Date().getFullYear());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const animationClass = isMounted ? 'opacity-0 animate-fade-in-up [animation-fill-mode:forwards]' : 'opacity-0';

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1">
                <section className="bg-primary/10 py-16 text-center overflow-hidden">
                    <div className={`container mx-auto px-4 ${animationClass}`}>
                        <h1 className="text-4xl font-bold font-headline text-primary">{t('aboutPage.title', { siteTitle })}</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t('aboutPage.subtitle')}
                        </p>
                    </div>
                </section>

                <section className="py-16 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className={`grid md:grid-cols-2 gap-12 items-center ${animationClass} [animation-delay:200ms]`}>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{t('aboutPage.storyTitle')}</h2>
                                <p className="text-muted-foreground mb-4">
                                    {t('aboutPage.storyText1', { year: year - 2, siteTitle })}
                                </p>
                                <p className="text-muted-foreground">
                                    {t('aboutPage.storyText2')}
                                </p>
                            </div>
                            <div className="relative h-80 rounded-lg overflow-hidden">
                                <Image 
                                    src="https://placehold.co/600x400.png" 
                                    alt="Our Team" 
                                    fill
                                    className="object-cover"
                                    data-ai-hint="team collaboration"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-secondary/50 overflow-hidden">
                    <div className={`container mx-auto px-4 ${animationClass} [animation-delay:400ms]`}>
                        <h2 className="text-3xl font-bold text-center mb-12">{t('aboutPage.whyChooseUs')}</h2>
                        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <Target className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>{t('aboutPage.missionTitle')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{t('aboutPage.missionText')}</p>
                                </CardContent>
                            </Card>
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <Eye className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>{t('aboutPage.visionTitle')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{t('aboutPage.visionText')}</p>
                                </CardContent>
                            </Card>
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <Users className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>{t('aboutPage.valuesTitle')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{t('aboutPage.valuesText')}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
            <AppFooter />
        </div>
    );
}
