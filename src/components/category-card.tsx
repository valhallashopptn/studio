
"use client"

import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <Card 
        className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full hover:border-primary/50 cursor-pointer group"
        onClick={onClick}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
        <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="category icon"
            unoptimized={category.image.startsWith('data:image')}
        />
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg text-center">{category.name}</h3>
      </CardContent>
    </Card>
  );
}
