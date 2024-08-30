// src/components/layout/Header.tsx

"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@jsinfo/components/ui/Input';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import LastUpdateBadge from '../modern/LastUpdateBadge';
import CurrencyChangeButton from '../modern/CurrencyChangeButton';
import LavaLogoLink from '../modern/LavaLogoLink';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileNavigation />
      <LavaLogoLink />
      <Navigation />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <LastUpdateBadge />
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
        <CurrencyChangeButton />
      </div>
    </header>
  );
}