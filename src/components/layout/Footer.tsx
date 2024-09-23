// src/components/layout/Footer.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <span className="text-sm text-muted-foreground">
        <Link href="https://www.lavanet.xyz/" className="flex items-center footer-link" target="_blank" rel="noopener noreferrer">
          <Image
            src="https://lava-fe-assets.s3.amazonaws.com/lava-icon.svg"
            alt="Lava Network Logo"
            width={24}
            height={24}
            style={{ marginRight: "10px", marginLeft: "30px" }}
          />
          <a href="https://www.lavanet.xyz/" className='footer-link' target="_blank" rel="noopener noreferrer">
            Lava Network
          </a>
        </Link>
      </span>
      <span className="ml-auto text-sm text-muted-foreground mr-50" style={{ marginRight: "30px" }}>
        Made with ❤️ by&nbsp;
        <a href="https://x.com/magmadevs" className='footer-link' target="_blank" rel="noopener noreferrer">
          Magma Devs
        </a>
      </span>
    </footer>
  );
}
