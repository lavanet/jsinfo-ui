import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes'
import '@radix-ui/themes/styles.css';
import Layout from '../components/layout'

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider attribute="class">
            <Theme appearance="dark">
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Theme>
        </ThemeProvider>
    )
}

export default MyApp