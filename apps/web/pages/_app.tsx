import type { AppProps } from 'next/app';
import { QueryProvider } from '../src/providers/QueryProvider';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { ThemeProvider } from '../src/contexts/SimpleThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import NavigationProvider from '../components/navigation/NavigationProvider';
import '../styles/globals.css';
import { ToastHost } from '../components/ui/ToastHost';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ToastHost>
              <NavigationProvider>
                <Component {...pageProps} />
              </NavigationProvider>
            </ToastHost>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}