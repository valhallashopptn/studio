
"use client";

import * as React from "react"
import { Star } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"

import { reviews } from "@/lib/data"
import type { Review } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={review.avatar} alt={review.name} data-ai-hint="person portrait" />
          <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">{review.name}</h4>
          <div className="flex justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
              />
            ))}
          </div>
        </div>
        <p className="text-muted-foreground italic text-sm flex-grow">"{review.text}"</p>
        <Badge variant="secondary">For: {review.product}</Badge>
      </CardContent>
    </Card>
  )
}

export function Reviews() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    )

  return (
    <section id="reviews" className="w-full py-16 bg-secondary/30">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2 font-headline">What Our Customers Say</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">Real reviews from our awesome community of gamers and digital enthusiasts.</p>
        
        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2 h-full">
                  <ReviewCard review={review} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  )
}
