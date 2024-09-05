// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Container } from "@radix-ui/themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Theme } from "@radix-ui/themes";
import { PageProvider } from "@jsinfo/components/legacy/PageProvider";
import { GetPageTitle } from "@jsinfo/lib/env";
import { Inter as FontSans } from "next/font/google";
import Header from "@jsinfo/components/layout/Header";
import Footer from "@jsinfo/components/layout/Footer";
import { cn } from "@jsinfo/lib/css"
import { TooltipProvider } from "@jsinfo/components/radixui/Tooltip";
import { NoSsrComponent } from "@jsinfo/components/helpers/NoSsrComponent";
import { ThemeProvider as RadixUiThemeProvider } from "@jsinfo/components/radixui/ThemeProvider";

import '@radix-ui/themes/styles.css';
import "./styles/globals.css";
import "./styles/paginationcontrol.css";
import "./styles/accountinfocard.css";
import "./styles/rsuite.css";
import "./styles/ui.css";
import "./styles/modern.css";
import "./styles/legacy.css";

export const metadata: Metadata = {
  title: GetPageTitle(),
  description: "Lava Blockchain Insights Hub",
};

export const viewport: Viewport = {
  colorScheme: "dark",
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >

        <RadixUiThemeProvider
          attribute="class"
          defaultTheme="dark"
        >

          <Container>
            <SpeedInsights />
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
              <Analytics />
            </div>
          </Container>

        </RadixUiThemeProvider>

      </body>
    </html>
  );
}