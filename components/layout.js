import { Analytics } from "@vercel/analytics/react";
import { Container } from "@radix-ui/themes";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children }) {
  return (
    <Container>
      <SpeedInsights />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Analytics />
    </Container>
  );
}
