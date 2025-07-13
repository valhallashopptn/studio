
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useTranslation } from '@/hooks/use-translation';
import { LiveChatSupport } from '@/components/live-chat-support';
import { Snowfall } from '@/components/snowfall';
import { AuthInitializer } from '@/hooks/use-auth';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  const { siteTitle } = useSiteSettings();
  const { locale } = useTranslation();

  const isDark = !['classic-light', 'winter-wonderland'].includes(theme);
  const isWinterTheme = theme === 'winter-wonderland';
  const baseFont = theme === 'cyber-green' ? 'font-mono' : 'font-sans';
  const effectiveFont = locale === 'ar' ? 'font-cairo' : baseFont;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} data-theme={theme} className={cn({ dark: isDark })}>
      <head>
        <title>{siteTitle}</title>
        <meta name="description" content={`Your one-stop shop for game top-ups and digital products at ${siteTitle}.`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&family=Cairo:wght@400;500;700&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <AuthInitializer />
        {isWinterTheme && <Snowfall />}
        {children}
        <Toaster />
        <LiveChatSupport />
      </body>
    </html>
  );
}
