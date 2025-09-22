import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations for navigation
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    'nav.pickups': 'Pickups',
    'nav.earnings': 'Earnings',
    'nav.bins': 'My Bins',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',

    // Authentication
    'auth.signin': 'Sign In',
    'auth.getstarted': 'Get Started',
    'auth.logout': 'Sign Out',
    'auth.profile': 'Profile Settings',
    'auth.account': 'Account Settings',

    // User roles
    'role.worker': 'Worker',
    'role.customer': 'Customer',
    'role.bin_owner': 'Bin Owner',

    // Verification
    'verification.verified': 'Verified',
    'verification.pending': 'Pending',
    'verification.rejected': 'Rejected',
    'verification.not_started': 'Not Started',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.features': 'Fonctionnalités',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Tableau de Bord',
    'nav.pickups': 'Collectes',
    'nav.earnings': 'Gains',
    'nav.bins': 'Mes Poubelles',
    'nav.analytics': 'Analytiques',
    'nav.settings': 'Paramètres',

    // Authentication
    'auth.signin': 'Se Connecter',
    'auth.getstarted': 'Commencer',
    'auth.logout': 'Se Déconnecter',
    'auth.profile': 'Paramètres Profil',
    'auth.account': 'Paramètres Compte',

    // User roles
    'role.worker': 'Travailleur',
    'role.customer': 'Client',
    'role.bin_owner': 'Propriétaire de Poubelle',

    // Verification
    'verification.verified': 'Vérifié',
    'verification.pending': 'En Attente',
    'verification.rejected': 'Rejeté',
    'verification.not_started': 'Non Commencé',
  },
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Auto-detect browser language
    const detectLanguage = (): Language => {
      // Check if there's a saved language preference first
      const savedLanguage = localStorage.getItem('klynaa_language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
        return savedLanguage;
      }

      // Get browser language
      const browserLang = navigator.language.toLowerCase();

      // Check if browser language is French or French variant
      if (browserLang.startsWith('fr')) {
        return 'fr';
      }

      // Check navigator.languages for French
      if (navigator.languages && navigator.languages.length > 0) {
        for (const lang of navigator.languages) {
          if (lang.toLowerCase().startsWith('fr')) {
            return 'fr';
          }
        }
      }

      // Default to English
      return 'en';
    };

    const detectedLanguage = detectLanguage();
    setLanguageState(detectedLanguage);
    localStorage.setItem('klynaa_language', detectedLanguage);
  }, []);

  const t = (key: string, fallback?: string): string => {
    const translation = translations[language][key as keyof typeof translations['en']];
    return translation || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}