import { create } from 'zustand';
import es from './locales/es.json';
import en from './locales/en.json';

type Language = 'es' | 'en';
type Translations = typeof es;

interface I18nState {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  lang: 'es',
  setLang: (lang) => set({ lang }),
  t: (path: string) => {
    const lang = get().lang;
    const dict = lang === 'en' ? en : es;
    const keys = path.split('.');
    let result: any = dict;
    
    for (const key of keys) {
      if (result[key]) {
        result = result[key];
      } else {
        return path;
      }
    }
    return result;
  },
}));

export const useTranslate = () => {
  const { t } = useI18nStore();
  return t;
};
