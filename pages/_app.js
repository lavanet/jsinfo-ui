import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes'
import '@radix-ui/themes/styles.css';
import Layout from '../components/layout'

// https://www.radix-ui.com/themes/playground 

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider attribute="class">
            <Theme appearance="dark" grayColor="sage" radius="large" scaling="95%">
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Theme>
        </ThemeProvider>
    )
}

export default MyApp