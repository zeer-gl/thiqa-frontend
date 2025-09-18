import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
    en: {
        translation: en
    },
    ar: {
        translation: ar
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        // Initial language; will be overridden by detector if a saved value exists
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'ar'],
        debug: true,
        detection: {
            // Prefer persisted user choice, then cookies/query, then browser, then <html lang>
            order: ['localStorage', 'cookie', 'querystring', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
