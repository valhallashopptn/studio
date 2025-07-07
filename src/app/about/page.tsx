
"use client"
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AppFooter } from '@/components/app-footer';

export default function AboutPage() {
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
                        <h1 className="text-4xl font-bold font-headline text-primary">About TopUp Hub</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            We are dedicated to providing a seamless and secure platform for all your digital top-up needs.
                        </p>
                    </div>
                </section>

                <section className="py-16 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className={`grid md:grid-cols-2 gap-12 items-center ${animationClass} [animation-delay:200ms]`}>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                                <p className="text-muted-foreground mb-4">
                                    Founded in {year - 2}, TopUp Hub started with a simple idea: to make digital purchases easier and more accessible for everyone. We saw a need for a reliable platform where users could quickly top up game credits, buy subscriptions, and purchase digital gift cards without hassle.
                                </p>
                                <p className="text-muted-foreground">
                                    Today, we've grown into a trusted marketplace, serving thousands of customers worldwide. Our commitment to security, speed, and customer satisfaction remains at the core of everything we do.
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
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
                        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <Target className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Our Mission</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">To provide the fastest, most secure, and user-friendly platform for digital goods and services.</p>
                                </CardContent>
                            </Card>
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <Eye className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Our Vision</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">To be the world's leading digital marketplace, connecting users with the products they love, instantly.</p>
                                </CardContent>
                            </Card>
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                                        <Users className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>Our Values</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Customer-centricity, integrity, and innovation drive us forward every day.</p>
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
