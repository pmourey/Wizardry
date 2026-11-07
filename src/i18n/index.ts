import { useState, useEffect } from 'react';
import { AppLanguage, LocaleSchema, CommonTranslations } from './types';
import { enLocale } from './locales/en';
import { frLocale } from './locales/fr';

export * from './types';

export type I18nBundle = LocaleSchema & CommonTranslations;

export const LOCALES: Record<AppLanguage, I18nBundle> = {
  en: {
    ...enLocale,
    ...enLocale.common,
  },
  fr: {
    ...frLocale,
    ...frLocale.common,
  },
};

const LANG_STORAGE_KEY = 'wiz_app_lang';

export const getAppLanguage = (): AppLanguage => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  }
  return 'en'; // Default to English per request
};

export const setAppLanguage = (lang: AppLanguage) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent('wizardry_lang_change', { detail: lang }));
  }
};

export function useLanguage(): [AppLanguage, (lang: AppLanguage) => void] {
  const [lang, setLangState] = useState<AppLanguage>(getAppLanguage);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppLanguage>;
      if (customEvent.detail && (customEvent.detail === 'en' || customEvent.detail === 'fr')) {
        setLangState(customEvent.detail);
      }
    };
    window.addEventListener('wizardry_lang_change', handleLangChange);
    return () => window.removeEventListener('wizardry_lang_change', handleLangChange);
  }, []);

  const changeLang = (newLang: AppLanguage) => {
    setLangState(newLang);
    setAppLanguage(newLang);
  };

  return [lang, changeLang];
}

export function useI18n(): {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: I18nBundle;
} {
  const [lang, setLang] = useLanguage();
  return {
    lang,
    setLang,
    t: LOCALES[lang] || LOCALES.en,
  };
}

export const getTranslation = (lang: AppLanguage = getAppLanguage()): I18nBundle => {
  return LOCALES[lang] || LOCALES.en;
};

// 100% backward compatible dictionary for existing components
export const UI_TEXT = {
  en: LOCALES.en,
  fr: LOCALES.fr,
};

