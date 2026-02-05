import { createContext, useContext, useState } from 'react';
import nl from './nl.json';
import fr from './fr.json';

const translations = { nl, fr };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('nl');

  const t = (key) => {
    return translations[language]?.[key] || translations.nl[key] || key;
  };

  const getMunicipalityName = (municipality) => {
    if (language === 'nl') return municipality.name_nl;
    return municipality.name_fr;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getMunicipalityName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
