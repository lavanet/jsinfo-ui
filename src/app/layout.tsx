// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Container } from "@radix-ui/themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageProvider } from "@jsinfo/components/classic/PageProvider";
import { GetPageTitle } from "@jsinfo/lib/env";
import { Inter as FontSans } from "next/font/google";
import Header from "@jsinfo/components/layout/Header";
import Footer from "@jsinfo/components/layout/Footer";
import { cn } from "@jsinfo/lib/css"
import { TooltipProvider } from "@jsinfo/components/shadcn/ui/Tooltip";
import { NoSsrComponent } from "@jsinfo/components/helpers/NoSsrComponent";
import { ThemeProvider as ShadcnThemeProvider } from "@jsinfo/components/shadcn/ThemeProvider";
import Script from 'next/script';

import '@radix-ui/themes/styles.css';
import "./styles/globals.css";
import "./styles/rsuite.css";
import "./styles/shadcn.css";
import "./styles/modern.css";
import "./styles/classic.css";

export const metadata: Metadata = {
  title: GetPageTitle(),
  description: "Lava Network Info Hub",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  // width: '120',
  initialScale: 0.6,
  // maximumScale: 1.4,
  userScalable: true,
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="console-warnings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              console.warn = function() {};
              console.error = function() {};
            `,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ShadcnThemeProvider attribute="class" defaultTheme="dark">
          <Container>
            {!isDev && <SpeedInsights />}
            <div className="flex min-h-screen mx-auto flex-col">
              <PageProvider>
                <TooltipProvider>
                  <NoSsrComponent>
                    <Header />
                    <main className="body-content">
                      <div className="body-content-boundary">
                        <div className="body-content-boundary-inner">
                          {children}
                        </div>
                      </div>
                    </main>
                    <Footer />
                  </NoSsrComponent>
                </TooltipProvider>
              </PageProvider>
              {!isDev && <Analytics />}
            </div>
          </Container>
        </ShadcnThemeProvider>
      </body>
    </html>
  )
}