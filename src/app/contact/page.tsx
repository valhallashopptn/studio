
"use client"

import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const year = new Date().getFullYear();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Message Sent!",
                description: "Thanks for reaching out. We'll get back to you soon.",
            });
            setName('');
            setEmail('');
            setMessage('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-headline text-primary">Get in Touch</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send us a Message</CardTitle>
                            <CardDescription>Fill out the form and we'll get back to you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="name">Name</label>
                                    <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="email">Email</label>
                                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="message">Message</label>
                                    <Textarea id="message" placeholder="Your message..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} />
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold">Contact Information</h3>
                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                               <div className="bg-primary/10 p-3 rounded-full">
                                   <Mail className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">Email</h4>
                                   <p className="text-muted-foreground">support@topuphub.com</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                   <Phone className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">Phone</h4>
                                   <p className="text-muted-foreground">+1 (555) 123-4567</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                   <MapPin className="h-6 w-6 text-primary" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">Address</h4>
                                   <p className="text-muted-foreground">123 Digital Lane, Tech City, 12345</p>
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 bg-secondary text-secondary-foreground text-center text-sm">
                <p>&copy; {year} TopUp Hub. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
