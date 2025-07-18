
"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Sparkles } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { useTranslation } from '@/hooks/use-translation'
import { useProducts } from '@/hooks/use-products'

const recommendationSchema = z.object({
  purchaseHistory: z.string().min(10, "Please describe your past purchases in a bit more detail."),
})

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation();
  const { products } = useProducts();

  const form = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      purchaseHistory: "",
    },
  })

  const getProductCatalogForAI = () => products.map(p => `${p.name} - ${p.description}`).join('\n');

  async function onSubmit(values: z.infer<typeof recommendationSchema>) {
    setIsLoading(true)
    setRecommendations(null)
    setError("This feature is temporarily disabled.");
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent"/>
            <CardTitle className="text-2xl font-headline">{t('recommendations.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('recommendations.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="purchaseHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('recommendations.historyLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('recommendations.historyPlaceholder')}
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={true} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('recommendations.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('recommendations.getRecommendations')}
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6">
          {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {recommendations && (
            <div className="p-4 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold mb-2">{t('recommendations.suggestions')}</h4>
                <p className="text-sm whitespace-pre-wrap">{recommendations}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
