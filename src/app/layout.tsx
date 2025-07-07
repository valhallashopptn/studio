
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();
  const { siteTitle } = useSiteSettings();

  const isDark = theme !== 'classic-light';
  const font = theme === 'cyber-green' ? 'font-mono' : 'font-sans';

  return (
    <html lang="en" data-theme={theme} className={cn({ dark: isDark })}>
      <head>
        <title>{siteTitle}</title>
        <meta name="description" content={`Your one-stop shop for game top-ups and digital products at ${siteTitle}.`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className={cn('antialiased', font)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
