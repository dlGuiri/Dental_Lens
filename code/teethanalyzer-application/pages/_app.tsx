import "../styles/globals.css";
import type { AppProps } from "next/app";
// This layout wraps every page with shared UI
import Layout from "components/layout";
import { ApolloProvider } from "@apollo/client";
import client from "lib/apolloClient";
import { PredictionProvider } from "context/PredictionContext";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

// Custom layout type
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: any;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={pageProps.session}>
      <ApolloProvider client={client}>
        <PredictionProvider>
          {getLayout(<Component {...pageProps} />)}
        </PredictionProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
