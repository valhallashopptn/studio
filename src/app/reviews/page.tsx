
"use client"

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useReviews } from '@/hooks/use-reviews';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ReviewForm } from '@/components/review-form';
import { Star, MessageSquarePlus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';


export default function ReviewsPage() {
    const { reviews } = useReviews();
    const [isMounted, setIsMounted] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { totalReviews, averageRating } = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return { totalReviews: 0, averageRating: 0 };
        }
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        const average = total / reviews.length;
        return { totalReviews: reviews.length, averageRating: average };
    }, [reviews]);


    const handleReviewSubmitted = () => {
        setIsFormOpen(false);
    };

    const animationClass = (delay: number) => isMounted ? `opacity-0 animate-fade-in-up [animation-fill-mode:forwards] [animation-delay:${delay}ms]` : 'opacity-0';

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1">
                <section className="bg-primary/10 py-16 text-center overflow-hidden">
                    <div className={`container mx-auto px-4 ${animationClass(0)}`}>
                        <h1 className="text-4xl font-bold font-headline text-primary">Customer Reviews</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            See what our community is saying about their experience.
                        </p>

                        {isMounted && reviews.length > 0 && (
                             <div className={`mt-8 flex justify-center items-center gap-6 ${animationClass(100)}`}>
                                <div className="flex items-center gap-4 p-3 bg-background/50 rounded-full border shadow-sm">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-6 w-6 ${i < Math.round(averageRating) ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} />
                                        ))}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                                      <span className="text-muted-foreground">from {totalReviews} reviews</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button className={`mt-8 ${animationClass(200)}`}>
                                    <MessageSquarePlus className="mr-2 h-5 w-5" />
                                    Leave Your Own Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Share Your Feedback</DialogTitle>
                                    <DialogDescription>
                                        We'd love to hear about your experience with our products.
                                    </DialogDescription>
                                </DialogHeader>
                                <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </section>

                <section className="py-16 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reviews.map((review, index) => (
                                <Card key={review.id} className={`flex flex-col ${animationClass(300 + index * 50)}`}>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={review.avatar} alt={review.name} data-ai-hint="person portrait" />
                                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold">{review.name}</h4>
                                            <div className="flex items-center">
                                                 {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} />
                                                 ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <p className="text-muted-foreground italic">"{review.text}"</p>
                                        <Badge variant="secondary">Product: {review.product}</Badge>
                                    </CardContent>
                                    {review.proofImage && (
                                        <CardFooter>
                                            <Button variant="outline" className="w-full" onClick={() => setSelectedProof(review.proofImage!)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Proof
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <AlertDialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
                <AlertDialogContent className="max-w-3xl">
                     <AlertDialogHeader>
                        <AlertDialogTitle>Review Proof</AlertDialogTitle>
                        <AlertDialogDescription>
                            Image uploaded by the reviewer.
                        </AlertDialogDescription>
                     </AlertDialogHeader>
                     {selectedProof && (
                        <div className="relative aspect-video w-full mt-4">
                            <Image src={selectedProof} alt="Review proof" fill className="rounded-md object-contain" />
                        </div>
                     )}
                     <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setSelectedProof(null)}>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AppFooter />
        </div>
    )
}
