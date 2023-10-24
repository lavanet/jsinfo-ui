import { Analytics } from '@vercel/analytics/react';
import { Container } from '@radix-ui/themes';
import { Navbar } from './navbar'
import { Footer } from './footer'

export default function Layout({ children }) {
  return (
    <Container>
      <Navbar/>
      <main>{children}</main>
      <Footer/>
      <Analytics />
    </Container>
  )
}
