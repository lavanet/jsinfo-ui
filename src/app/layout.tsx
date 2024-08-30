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
import { TooltipProvider } from "@jsinfo/components/modern/Tooltip";

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

  //  max-w-screen-2xl

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Theme
          appearance="dark"
          accentColor="tomato"
          grayColor="slate"
          panelBackground="solid"
          radius="full"
        >
          <Container>
            <SpeedInsights />
            <div className="flex min-h-screen mx-auto flex-col">
              <PageProvider>
                <TooltipProvider>
                  <Header />
                  <main className="body-content flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <div className="max-w-screen-2xl mx-auto">
                      {children}
                    </div>
                  </main>
                  <Footer />
                </TooltipProvider>
              </PageProvider>
              <Analytics />
            </div>
          </Container>
        </Theme>
      </body>
    </html>
  );
}