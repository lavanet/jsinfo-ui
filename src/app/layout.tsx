// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Container } from "@radix-ui/themes";
import { Navbar } from "@jsinfo/components/Navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Theme } from "@radix-ui/themes";
import { PageProvider } from "@jsinfo/components/PageProvider";

import '@radix-ui/themes/styles.css';
import "./styles/globals.css";
import "./styles/paginationcontrol.css";
import "./styles/rsuite.css";
import { GetPageTitle } from "@jsinfo/common/utils";

// export const revalidate = 60;
// export const fetchCache = 'only-cache';
// export const dynamic = 'auto';


export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: GetPageTitle(),
  description: "Lava Blockchain Insights Hub",
};

export const viewport: Viewport = {
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme
          appearance="dark"
          accentColor="tomato"
          grayColor="slate"
          panelBackground="solid"
          radius="full"
          scaling="90%"
        >
          <Container>
            <SpeedInsights />
            <div style={{ margin: "10px" }}>
              <PageProvider>
                <Navbar />
                <main>{children}</main>
              </PageProvider>
              <Analytics />
            </div>
          </Container>
        </Theme>
      </body>
    </html>
  );
}