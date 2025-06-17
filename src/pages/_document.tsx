import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Fontes modernas do Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Meta tags para melhor performance */}
        <meta name="theme-color" content="#F9FAFB" />
        <meta name="msapplication-TileColor" content="#F9FAFB" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
