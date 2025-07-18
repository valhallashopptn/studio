
"use client"

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
} from '@/components/ui/card';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="group h-full w-full [perspective:1000px]">
      <Card 
        className="relative h-full w-full rounded-lg shadow-md transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer"
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
    </Link>
  );
}
