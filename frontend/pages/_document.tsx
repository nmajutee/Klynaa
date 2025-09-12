import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Klynaa Design System - Arimo Font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
          {/* Favicon and Meta */}
          <meta name="theme-color" content="#4CAF50" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;