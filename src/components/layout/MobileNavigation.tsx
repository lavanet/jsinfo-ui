// src/components/layout/MobileNavigation.tsx

import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@jsinfo/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '@jsinfo/components/ui/Sheet';
import LavaLogoLink from '../modern/LavaLogoLink';

export default function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 mobile-navbar-button">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className='mobile-navbar'>
        <nav className="mobile-navbar-inner grid gap-6 text-lg font-medium">
          <LavaLogoLink />
          <Link href="/" className="nav-link nav-link-selected">
            Dashboard
          </Link>
          <Link href="/pools" className="nav-link">
            Pools
          </Link>
          <Link href="/providers" className="nav-link">
            Providers
          </Link>
          <Link href="/chains" className="nav-link">
            Chains
          </Link>
          <Link href="/consumers" className="nav-link">
            Consumers
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}