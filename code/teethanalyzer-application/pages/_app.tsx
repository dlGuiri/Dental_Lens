// pages/_app.tsx (Updated)
import "../styles/globals.css";
import type { AppProps } from "next/app";
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
  // Use the page's getLayout function if it exists, otherwise use the default Layout
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

// Example of how to use getLayout in your pages:
// 
// For pages that need patient layout:
// MyPage.getLayout = function getLayout(page: ReactElement) {
//   return <PatientLayout>{page}</PatientLayout>;
// };
//
// For pages that need dentist layout:
// MyPage.getLayout = function getLayout(page: ReactElement) {
//   return <DentistLayout>{page}</DentistLayout>;
// };
//
// For pages that need no layout (like login):
// MyPage.getLayout = function getLayout(page: ReactElement) {
//   return page;
// };