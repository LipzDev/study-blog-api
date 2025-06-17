import React from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { UserProvider } from "../context/user";
import { ToastProvider } from "../hooks/toast";
import { PostProvider } from "../hooks/useManagePosts";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Study Blog</title>
        <link rel="shortcut icon" href="/img/logo.png" />
        <link rel="apple-touch-icon" href="/img/logo.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* TAGS DE SEO OG*/}
        <meta property="og:title" content="Study Blog" />
        <meta property="og:locale" content="pt-BR" />
        <meta property="og:site_name" content="Study Blog" />
        <meta property="og:description" content="Your Learning Platform" />
        <meta name="description" content="Your Learning Platform" />
        <meta property="og:image" content="/img/logo.png" />
        {/* TAGS DE SEO TWITTER*/}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Study Blog" />
        <meta name="twitter:description" content="Your Learning Platform" />
        <meta name="twitter:site" content="@StudyBlog" />
        <meta name="twitter:creator" content="@StudyBlog" />
        <meta name="twitter:image" content="/img/logo.png" />
        <meta name="theme-color" content="#0ea5e9" />
      </Head>
      <ToastProvider>
        <PostProvider>
          <UserProvider>
            <Component {...pageProps} />
          </UserProvider>
        </PostProvider>
      </ToastProvider>
    </>
  );
}

export default App;
