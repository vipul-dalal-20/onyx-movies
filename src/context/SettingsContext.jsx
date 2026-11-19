import { useState, useEffect } from 'react';
import { SettingsContext } from './SettingsContext.js';

export const SettingsProvider = ({ children }) => {
  const [includeAdult, setIncludeAdult] = useState(() => {
    return localStorage.getItem('onyx_include_adult') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('onyx_include_adult', includeAdult);
  }, [includeAdult]);

  const toggleAdult = () => setIncludeAdult(prev => !prev);

  return (
    <SettingsContext.Provider value={{ includeAdult, toggleAdult }}>
      {children}
    </SettingsContext.Provider>
  );
};
