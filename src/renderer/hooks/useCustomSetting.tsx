import { useState } from 'react';
import { UserPreferences } from '../types/setting';

const DefaultPreferences: UserPreferences = {
  theme: 'light',
  blurAmount: 2,
  cardLayout: 'grid',
};

const useCustomSetting = (): [
  UserPreferences,
  (newValue: Partial<UserPreferences>) => void,
] => {
  const [customSetting, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : DefaultPreferences;
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return DefaultPreferences;
    }
  });
  const setCustomSetting = (newValue: Partial<UserPreferences>) => {
    setUserPreferences((prev) => {
      const updated = { ...prev, ...newValue };
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      window.dispatchEvent(new Event('storagePreferences'));
      return updated;
    });
  };

  return [customSetting, setCustomSetting];
};

export default useCustomSetting;
