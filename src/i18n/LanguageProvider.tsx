import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  languages,
  type LanguageCode,
  translations,
} from "./translations";

const STORAGE_KEY = "b4f-web-language";

type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  language: LanguageCode;
  locale: string;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveInitialLanguage(): LanguageCode {
  const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;

  if (saved && languages.some((item) => item.code === saved)) {
    return saved;
  }

  const browserLanguage = navigator.language.toLowerCase();
  const match = languages.find((item) => browserLanguage.startsWith(item.code));

  return match?.code ?? "fr";
}

function interpolate(value: string, params?: TranslationParams) {
  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [key, replacement]) =>
      text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(resolveInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const selected = languages.find((item) => item.code === language) ?? languages[0];

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      locale: selected.locale,
      setLanguage: (nextLanguage) => setLanguageState(nextLanguage),
      t: (key, params) => {
        const translated = translations[language][key] ?? translations.fr[key] ?? key;
        return interpolate(translated, params);
      },
    }),
    [language, selected.locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useI18n doit être utilisé dans LanguageProvider.");
  }

  return value;
}
