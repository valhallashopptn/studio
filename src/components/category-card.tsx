
"use client"

import Image from 'next/image';
import {
  Card,
} from '@/components/ui/card';
import type { Category } from '@/lib/types';
import { Info } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <div className="group h-full w-full [perspective:1000px] cursor-pointer" onClick={onClick}>
      <Card 
        className="relative h-full w-full rounded-lg shadow-md transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
      >
        {/* Front Face: Image with overlayed title */}
        <div className="absolute h-full w-full [backface-visibility:hidden]">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                data-ai-hint="category icon"
                unoptimized={category.image.startsWith('data:image')}
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 p-4 text-center">
              <h3 className="font-semibold text-lg text-white">{category.name}</h3>
            </div>
            <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white/80">
              <Info className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Back Face: Background image with description */}
        <div className="absolute h-full w-full rounded-lg bg-secondary [backface-visibility:hidden] [transform:rotateY(180deg)]">
           <div className="relative h-full w-full overflow-hidden rounded-lg">
             <Image
                src={category.backImage}
                alt={`${category.name} details`}
                fill
                className="object-cover opacity-20"
                data-ai-hint="abstract pattern"
                unoptimized={category.backImage.startsWith('data:image')}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <h3 className="font-bold text-xl mb-2 text-secondary-foreground">{category.name}</h3>
                <p className="text-sm text-secondary-foreground">{category.description}</p>
            </div>
           </div>
        </div>
      </Card>
    </div>
  );
}
