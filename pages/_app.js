import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";
import Layout from "../components/layout";
import Head from "next/head";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="color-scheme" content="dark only" />
      </Head>
      <ThemeProvider attribute="class">
        <Theme
          appearance="dark"
          accentColor="tomato"
          grayColor="slate"
          panelBackground="solid"
          radius="full"
          scaling="90%"
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Theme>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
