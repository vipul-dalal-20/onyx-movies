import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext.js';

export const useSettings = () => useContext(SettingsContext);
