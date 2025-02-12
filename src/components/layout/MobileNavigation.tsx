// src/components/layout/MobileNavigation.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@jsinfo/components/shadcn/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '@jsinfo/components/shadcn/ui/Sheet';
import LavaLogoLink from '../modern/LavaLogoLink';
import { usePathname } from 'next/navigation';

export default function MobileNavigation() {
  const pathname = usePathname();

  const isActive = (x: string) => pathname === x;
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 mobile-navbar-button">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className='mobile-navbar'>
        <nav className="mobile-navbar-inner grid gap-6 text-lg font-medium">
          <LavaLogoLink />
          <Link href="/" className={`nav-link ${isActive('/') ? 'nav-link-selected' : ''}`} onClick={closeMenu}>
            Dashboard
          </Link>
          <Link href="/providers" className={`nav-link ${isActive('/providers') ? 'nav-link-selected' : ''}`} onClick={closeMenu}>
            Providers
          </Link>
          <Link href="/chains" className={`nav-link ${isActive('/chains') ? 'nav-link-selected' : ''}`} onClick={closeMenu}>
            Chains
          </Link>
          {/* <Link href="/events" className={`nav-link ${isActive('/events') ? 'nav-link-selected' : ''}`}>
            Events
          </Link> */}
          <Link href="/consumers" className={`nav-link ${isActive('/consumers') ? 'nav-link-selected' : ''}`} onClick={closeMenu}>
            Consumers
          </Link>
          <Link
            href="https://rewards.lavanet.xyz"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            Rewards
          </Link>
          <Link
            href="https://stats.lavanet.xyz"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            Network Stats
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}