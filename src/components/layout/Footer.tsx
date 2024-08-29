// src/components/layout/Footer.tsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="flex items-center justify-center h-16 border-t bg-background px-4 md:px-6">
      <span className="text-sm text-muted-foreground">
        © 2023 Acme Inc. All rights reserved.
      </span>
      <span className="ml-auto text-sm text-muted-foreground">
        Made with ❤️ by Magma Devs
      </span>
    </footer>
  );
}
