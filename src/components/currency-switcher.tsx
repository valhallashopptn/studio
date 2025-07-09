
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/use-currency';
import { DollarSign, Coins } from 'lucide-react';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {currency === 'USD' ? <DollarSign className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
          <span className="sr-only">Change currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[70]"
      >
        <DropdownMenuItem onClick={() => setCurrency('USD')}>
          USD ($)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency('TND')}>
          TND (DT)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
