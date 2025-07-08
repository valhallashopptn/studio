
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useContentSettings } from '@/hooks/use-content-settings';
import { Flame, Facebook, Twitter, Instagram } from 'lucide-react';
import { Separator } from './ui/separator';

const navLinks = [
    { href: '/', labelKey: 'nav.home' },
    { href: '/products', labelKey: 'nav.products' },
    { href: '/about', labelKey: 'nav.about' },
    { href: '/contact', labelKey: 'nav.contact' },
    { href: '/reviews', labelKey: 'nav.reviews' },
];

export function AppFooter() {
  const [year, setYear] = useState<number | null>(null);
  const { t } = useTranslation();
  const { siteTitle, logoUrl } = useSiteSettings();
  const { aboutSubtitle } = useContentSettings();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logo" width={32} height={32} className="rounded-sm" unoptimized={logoUrl.startsWith('data:image')} />
                ) : (
                  <Flame className="h-6 w-6 text-primary" />
                )}
                <h2 className="text-xl font-bold font-headline">{siteTitle}</h2>
            </Link>
            <p className="text-sm text-muted-foreground pr-8">{aboutSubtitle}</p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-card-foreground">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {navLinks.map(link => (
                  <li key={link.href}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {t(link.labelKey)}
                      </Link>
                  </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-card-foreground">{t('footer.followUs')}</h3>
            <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-6 w-6" /></a>
                <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-6 w-6" /></a>
                <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-6 w-6" /></a>
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-border/50" />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright', { year: year || new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
