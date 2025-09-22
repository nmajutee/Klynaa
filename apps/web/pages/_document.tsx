import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🚀 Theme initialization script running');
                try {
                  var theme = localStorage.getItem('klynaa-theme');
                  console.log('🚀 Found theme in localStorage:', theme);

                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  console.log('🚀 System prefers dark:', prefersDark);

                  var finalTheme = theme || (prefersDark ? 'dark' : 'light');
                  console.log('🚀 Final theme will be:', finalTheme);

                  if (finalTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.setProperty('--bg-color', '#111827');
                    document.documentElement.style.setProperty('--text-color', '#f3f4f6');
                    console.log('🚀 Applied dark theme');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.setProperty('--bg-color', '#f9fafb');
                    document.documentElement.style.setProperty('--text-color', '#111827');
                    console.log('🚀 Applied light theme');
                  }

                  console.log('🚀 HTML classes after init:', document.documentElement.className);
                } catch (e) {
                  console.error('🚀 Theme init error:', e);
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}