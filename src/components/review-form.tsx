
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReviews } from '@/hooks/use-reviews';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { products as allProducts } from '@/lib/data';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { Product } from '@/lib/types';

const reviewSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  product: z.string().min(1, 'Please select a product.'),
  rating: z.number().min(1, 'Rating is required.').max(5),
  text: z.string().min(10, 'Review must be at least 10 characters.'),
  proofImage: z.string().optional(),
});

export function ReviewForm({ onReviewSubmitted, productsToReview }: { onReviewSubmitted: () => void, productsToReview?: Product[] }) {
  const { addReview } = useReviews();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [hoverRating, setHoverRating] = useState(0);

  const productList = productsToReview && productsToReview.length > 0 ? productsToReview : allProducts;

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: '',
      product: productList[0]?.name || '',
      rating: 0,
      text: '',
      proofImage: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
        form.setValue('name', user.name);
    }
  }, [isAuthenticated, user, form]);

  const currentRating = form.watch('rating');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          form.setValue('proofImage', reader.result, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof reviewSchema>) {
    addReview(values);
    toast({
      title: t('reviewForm.submittedToast'),
      description: t('reviewForm.submittedToastDesc'),
    });
    form.reset({ name: isAuthenticated && user ? user.name : '', product: '', rating: 0, text: '', proofImage: '' });
    onReviewSubmitted();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reviewForm.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} readOnly={isAuthenticated} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reviewForm.productLabel')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reviewForm.productPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productList.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reviewForm.ratingLabel')}</FormLabel>
              <FormControl>
                 <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <Star
                                key={ratingValue}
                                className={cn(
                                    'h-6 w-6 cursor-pointer transition-colors',
                                    ratingValue <= (hoverRating || currentRating)
                                        ? 'text-accent fill-accent'
                                        : 'text-muted-foreground/50'
                                )}
                                onClick={() => field.onChange(ratingValue)}
                                onMouseEnter={() => setHoverRating(ratingValue)}
                            />
                        )
                    })}
                 </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reviewForm.reviewLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('reviewForm.reviewPlaceholder')} {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>{t('reviewForm.proofLabel')}</FormLabel>
            <FormControl>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:text-primary file:font-semibold"
                />
            </FormControl>
        </FormItem>
        <Button type="submit">{t('reviewForm.submitButton')}</Button>
      </form>
    </Form>
  );
}
