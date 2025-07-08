'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const pathname = usePathname();

  // Show up to 4 links directly, the rest go in a "More" sheet.
  const primaryLinks = links.slice(0, 4);
  const secondaryLinks = links.slice(4);

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-background border-t md:hidden">
      <div className="flex h-full mx-auto font-medium">
        {primaryLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'inline-flex flex-1 flex-col items-center justify-center px-1 text-center group',
                isActive ? 'text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <link.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}

        {secondaryLinks.length > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex flex-1 flex-col items-center justify-center px-1 text-center text-muted-foreground hover:bg-muted group"
              >
                <Menu className="w-5 h-5 mb-1" />
                <span className="text-xs">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>More Navigation</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 py-4">
                {links.map((link) => (
                   <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center p-3 rounded-lg text-base font-semibold text-muted-foreground hover:text-primary hover:bg-muted"
                  >
                    <link.icon className="w-5 h-5 mr-4 text-primary/80" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
