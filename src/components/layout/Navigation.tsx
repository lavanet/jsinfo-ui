// src/components/layout/Navigation.tsx

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (x: string) => x === pathname;

  return (
    <nav className="topbar-nav flex-col text-lg font-medium md:flex md:flex-row md:items-center md:text-sm gap-3 md:gap-4 lg:gap-5">
      <Link href="/" className={`nav-link ${isActive('/') ? 'nav-link-selected' : ''}`}>
        Overview
      </Link>
      {/* <Link href="/pools" className={`nav-link ${isActive('/pools') ? 'nav-link-selected' : ''}`}>
          Pools
      </Link> */}
      <Link href="/providers" className={`nav-link ${isActive('/providers') ? 'nav-link-selected' : ''}`}>
        Providers
      </Link>
      <Link href="/chains" className={`nav-link ${isActive('/chains') ? 'nav-link-selected' : ''}`}>
        Chains
      </Link>
      <Link href="/events" className={`nav-link ${isActive('/events') ? 'nav-link-selected' : ''}`}>
        Events
      </Link>
      <Link href="/consumers" className={`nav-link ${isActive('/consumers') ? 'nav-link-selected' : ''}`}>
        Consumers
      </Link>
    </nav>
  );
}

