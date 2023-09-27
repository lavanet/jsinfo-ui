import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from 'next-themes'
import '@radix-ui/themes/styles.css';

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider attribute="class">
            <Theme appearance="dark">
                <Component {...pageProps} />
            </Theme>
        </ThemeProvider>
    )
}

export default MyApp