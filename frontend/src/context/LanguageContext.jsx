import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('marine_ai_lang') || 'EN';
  });

  const setLanguage = (newLang) => {
    const valid = ['EN', 'TE', 'TA', 'HI'].includes(newLang) ? newLang : 'EN';
    setLanguageState(valid);
    localStorage.setItem('marine_ai_lang', valid);
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return langDict[key] || TRANSLATIONS.EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'EN',
      setLanguage: () => {},
      t: (key) => TRANSLATIONS.EN[key] || key
    };
  }
  return context;
}

export default LanguageContext;
