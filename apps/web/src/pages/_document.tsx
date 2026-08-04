import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Encoding and browser compatibility */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Google Fonts (Inter) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Global SEO icons and branding theme */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="EchoReader AI" />
      </Head>
      <body className="antialiased font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
