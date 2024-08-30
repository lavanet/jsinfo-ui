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
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <LavaLogoLink />
          <Link href="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/pools" className="text-muted-foreground hover:text-foreground">
            Pools
          </Link>
          <Link href="/providers" className="text-muted-foreground hover:text-foreground">
            Providers
          </Link>
          <Link href="/chains" className="text-muted-foreground hover:text-foreground">
            Chains
          </Link>
          <Link href="/consumers" className="text-muted-foreground hover:text-foreground">
            Consumers
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}