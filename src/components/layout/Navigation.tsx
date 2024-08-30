// src/components/layout/Navigation.tsx

import React from 'react';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="topbar-nav flex-col text-lg font-medium md:flex md:flex-row md:items-center md:text-sm gap-3 md:gap-4 lg:gap-5">
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
  );
}

