'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from './types';
import { getPreferredLanguage, savePreferredLanguage } from './progress';
import { t as translate, type TranslationKey } from './i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translate(key, 'en'),
});

const LANGUAGE_CHANGE_EVENT = 'shikshamitra_language_change';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        return getPreferredLanguage();
      } catch {
        return 'en';
      }
    }
    return 'en';
  });

  useEffect(() => {
    // Listen for language changes across components
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && ['en', 'hi', 'mr'].includes(customEvent.detail)) {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    };
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    savePreferredLanguage(newLang);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<Language>(LANGUAGE_CHANGE_EVENT, { detail: newLang })
      );
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(key, language),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key) => translate(key, 'en'),
    };
  }
  return context;
}
