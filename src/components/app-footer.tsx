
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useContentSettings } from '@/hooks/use-content-settings';
import { Flame, Facebook, Twitter, Instagram, Send } from 'lucide-react';
import { Separator } from './ui/separator';

const footerNavLinks = [
    { href: '/', labelKey: 'nav.home' },
    { href: '/reviews', labelKey: 'nav.reviews' },
    { href: '/contact', labelKey: 'nav.contact' },
    { href: '/products', labelKey: 'nav.products' },
    { href: '/about', labelKey: 'nav.about' },
];

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-2.0441-.2733-4.2158-.2733-6.2599 0-.1636-.3847-.3973-.8742-.6082-1.2495a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8852 1.5152.069.069 0 00-.0321.0233C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0586c.2148.1354.4363.254.66.3615a.0751.0751 0 00.0776-.0206c.6776-.5545 1.133-1.2312 1.442-2.0022a.076.076 0 00-.0416-.1064c-.3997-.1582-.7882-.345-1.153-.56a.0726.0726 0 01.011-.0883c.311-.2411.6114-.492.896-.759a.0741.0741 0 01.0728-.011c3.9452 1.7646 8.18 1.7646 12.1252 0a.0741.0741 0 01.0727.011c.2847.267.585.5179.896.759a.0726.0726 0 01.011.0883c-.3648.214-.7533.4008-1.153.56a.076.076 0 00-.0416.1064c.309.7709.7644 1.4477 1.442 2.0022a.0751.0751 0 00.0776.0206c.2236-.1075.4451-.2261.66-.3615a.0824.0824 0 00.0312-.0586c.4182-4.4779-.4334-8.9808-2.3484-13.6647a.069.069 0 00-.032-.0233zM8.02 15.3312c-.7812 0-1.416-.6562-1.416-1.4655S7.2388 12.4 8.02 12.4s1.416.6562 1.416 1.4657-.6348 1.4655-1.416 1.4655zm7.96 0c-.7812 0-1.416-.6562-1.416-1.4655s.6348-1.4655 1.416-1.4655 1.416.6562 1.416 1.4657-.6348 1.4655-1.416 1.4655z"/>
    </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.46-6.63-1.8-1.79-1.34-2.83-3.31-3.02-5.4-.28-3.08.38-6.19 2.13-8.81.91-1.36 2.15-2.5 3.59-3.29.13-.07.26-.15.39-.22.18-.1.36-.2.54-.29 1.1-.53 2.29-.83 3.49-1.02.01-.58-.01-1.16.01-1.74.02-1.58.01-3.16.01-4.74z"/>
    </svg>
);


export function AppFooter() {
  const [year, setYear] = useState<number | null>(null);
  const { t } = useTranslation();
  const { siteTitle, logoUrl } = useSiteSettings();
  const { 
    aboutSubtitle,
    facebookUrl,
    instagramUrl,
    discordUrl,
    tiktokUrl,
    telegramUrl
  } = useContentSettings();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-background text-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
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

          <div>
              <h3 className="font-semibold mb-4 text-foreground">{t('footer.quickLinks')}</h3>
              <nav className="flex flex-col gap-2 text-sm">
                {footerNavLinks.map(link => (
                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors w-fit">
                        {t(link.labelKey)}
                    </Link>
                ))}
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t('footer.followUs')}</h3>
            <div className="flex gap-4">
                {facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-6 w-6" /></a>}
                {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-6 w-6" /></a>}
                {discordUrl && <a href={discordUrl} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-muted-foreground hover:text-primary transition-colors"><DiscordIcon className="h-6 w-6 fill-current" /></a>}
                {tiktokUrl && <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-primary transition-colors"><TiktokIcon className="h-6 w-6 fill-current" /></a>}
                {telegramUrl && <a href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-muted-foreground hover:text-primary transition-colors"><Send className="h-6 w-6" /></a>}
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
