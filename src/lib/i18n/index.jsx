import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const I18nContext = createContext(null);
const LANG_KEY = 'trustmatches_language';

export function getBrowserLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || navigator.userLanguage || 'en';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('fr')) return 'fr';
  return 'en';
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || getBrowserLanguage(); } catch { return 'en'; }
  });

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, params) => {
    return translate(key, language, params);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function translate(key, lang, params) {
  const keys = key.split('.');
  let value = resolveTranslation(keys, lang);
  if (value === undefined) {
    value = resolveTranslation(keys, 'en');
  }
  if (value === undefined) return key;
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? '');
  }
  return value;
}

function resolveTranslation(keys, lang) {
  // Lazy-load translations to avoid circular deps
  let dict = translationsCache[lang];
  if (!dict) {
    dict = lang === 'en' ? enTranslations : lang === 'es' ? esTranslations : frTranslations;
    translationsCache[lang] = dict;
  }
  let value = dict;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  return value;
}

// Cache for loaded translations
const translationsCache = {};

// Import translation dictionaries
import { en as enTranslations } from './translations';
import { es as esTranslations } from './translations';
import { fr as frTranslations } from './translations';

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { language: 'en', setLanguage: () => {}, t: (k) => k };
  }
  return ctx;
}