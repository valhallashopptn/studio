
"use client"

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { useTranslation } from '@/hooks/use-translation';

export default function ContactPage() {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: t('contactPage.messageSentToast'),
                description: t('contactPage.messageSentToastDesc'),
            });
            setName('');
            setEmail('');
            setMessage('');
            setIsSubmitting(false);
        }, 1000);
    };

    const animationClass = isMounted ? 'opacity-0 animate-fade-in-up [animation-fill-mode:forwards]' : 'opacity-0';

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-16 overflow-hidden">
                <div className={`text-center mb-12 ${animationClass}`}>
                    <h1 className="text-4xl font-bold font-headline text-primary">{t('contactPage.title')}</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('contactPage.subtitle')}
                    </p>
                </div>

                <div className={`grid md:grid-cols-2 gap-12 ${animationClass} [animation-delay:200ms]`}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('contactPage.formTitle')}</CardTitle>
                            <CardDescription>{t('contactPage.formDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="name">{t('contactPage.nameLabel')}</label>
                                    <Input id="name" placeholder={t('contactPage.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="email">{t('contactPage.emailLabel')}</label>
                                    <Input id="email" type="email" placeholder={t('contactPage.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="message">{t('contactPage.messageLabel')}</label>
                                    <Textarea id="message" placeholder={t('contactPage.messagePlaceholder')} value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? t('contactPage.sendingButton') : t('contactPage.sendButton')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold">{t('contactPage.contactInfoTitle')}</h3>
                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                               <div className="bg-primary/10 p-3 rounded-full">
                                   <Mail className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">{t('contactPage.email')}</h4>
                                   <p className="text-muted-foreground">support@topuphub.com</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                   <Phone className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">{t('contactPage.phone')}</h4>
                                   <p className="text-muted-foreground">+1 (555) 123-4567</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                   <MapPin className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">{t('contactPage.address')}</h4>
                                   <p className="text-muted-foreground">123 Digital Lane, Tech City, 12345</p>
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
