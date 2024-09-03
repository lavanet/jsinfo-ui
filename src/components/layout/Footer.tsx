// src/components/layout/Footer.tsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      {/* <span className="text-sm text-muted-foreground">
        © 2024 All rights reserved.
      </span> */}
      <span className="ml-auto text-sm text-muted-foreground mr-50" style={{ marginRight: "30px" }}>
        Made with ❤️ by&nbsp;
        <a href="https://github.com/lavanet/jsinfo" className='footer-link' target="_blank" rel="noopener noreferrer">
          Magma Devs
        </a>
      </span>
    </footer>
  );
}
