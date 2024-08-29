// src/components/layout/Navigation.tsx

import React from 'react';
import Link from 'next/link';
import { Package2 } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Package2 className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>
      <Link href="/" className="text-foreground transition-colors hover:text-foreground">
        Dashboard
      </Link>
      <Link href="/pools" className="text-muted-foreground transition-colors hover:text-foreground">
        Pools
      </Link>
      <Link href="/providers" className="text-muted-foreground transition-colors hover:text-foreground">
        Providers
      </Link>
      <Link href="/chains" className="text-muted-foreground transition-colors hover:text-foreground">
        Chains
      </Link>
      <Link href="/consumers" className="text-muted-foreground transition-colors hover:text-foreground">
        Consumers
      </Link>
    </nav>
  );
}

