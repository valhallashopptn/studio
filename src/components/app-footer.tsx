
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';

export function AppFooter() {
  const [year, setYear] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-6 bg-secondary text-secondary-foreground text-center text-sm">
      <p>{t('footer.copyright', { year: year || new Date().getFullYear() })}</p>
    </footer>
  );
}
