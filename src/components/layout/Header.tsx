// src/components/layout/Header.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Search, DollarSign } from 'lucide-react';
import { Badge } from '@jsinfo/components/ui/Badge';
import { Input } from '@jsinfo/components/ui/Input';
import { Toggle } from '@jsinfo/components/ui/Toggle';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';

export default function Header() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'LAVA' : 'USD');
  };

  const formatLastUpdate = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    return `Last update ${diff} minute${diff !== 1 ? 's' : ''} ago`;
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Navigation />
      <MobileNavigation />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Badge variant="outline">{formatLastUpdate(lastUpdate)}</Badge>
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <div className="flex justify-between items-center">
          <Toggle variant="outline" aria-label="Toggle currency" pressed={currency === 'LAVA'} onPressedChange={toggleCurrency}>
            {currency === 'USD' ? <DollarSign className="h-4 w-4" /> : 'LAVA'}
          </Toggle>
        </div>
      </div>
    </header>
  );
}