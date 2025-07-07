'use client';

import { useState, useEffect } from 'react';

export function AppFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-6 bg-secondary text-secondary-foreground text-center text-sm">
      <p>&copy; {year} TopUp Hub. All Rights Reserved.</p>
    </footer>
  );
}
