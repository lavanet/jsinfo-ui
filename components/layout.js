import { Flex, Text, Card, Box, Table, Container, Tabs } from '@radix-ui/themes';
import { Navbar } from './navbar'
import { Footer } from './footer'

export default function Layout({ children }) {
  return (
    <Container>
      <Navbar/>
      <main>{children}</main>
      <Footer/>
    </Container>
  )
}
