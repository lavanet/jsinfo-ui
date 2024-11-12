// src/components/layout/Header.tsx

"use client";

import React, { useEffect, useState } from 'react';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import LastUpdateBadge from '../modern/LastUpdateBadge';
import CurrencyChangeButton from '../modern/CurrencyChangeButton';
import LavaLogoLink from '../modern/LavaLogoLink';
import SearchForm from './SearchBar';
import { NetworkSwitch } from './_components/NetworkSwitch';

export default function Header() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 60;
      const currentScroll = window.scrollY;

      const newOpacity = currentScroll < threshold ? 1 : 0;
      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isWindows = navigator.platform.indexOf('Win') > -1;
    if (isWindows) {
      const bodyContent = document.querySelector('.body-content');
      if (bodyContent) {
        bodyContent.classList.add('windows-adjustment');
      }
      const topHeader = document.querySelector('.top-header');
      if (topHeader) {
        topHeader.classList.add('windows-adjustment-header');
      }
    }
  }, []);

  return (
    <header className="top-header sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 header-fade" style={{ opacity }}>
      <MobileNavigation />
      <LavaLogoLink />
      <NetworkSwitch />
      <Navigation />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <LastUpdateBadge />
        <SearchForm />
        <CurrencyChangeButton />
      </div>
    </header>
  );
}