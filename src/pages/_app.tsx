import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast"
import Head from "next/head";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <ClerkProvider {...pageProps}>
      <Head>
        <title>Emojiland</title>
        <meta name="description" content="Twitter, but emojis only" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Toaster position = "bottom-center"/>
      <Component {...pageProps} />
      </ClerkProvider>
    </main>
  );
};

export default api.withTRPC(MyApp);
