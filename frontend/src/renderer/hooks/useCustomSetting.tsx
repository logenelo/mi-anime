import { useEffect, useState } from 'react';
import { UserPreferences } from '../types/setting';

const DefaultPreferences: UserPreferences = {
  theme: 'light',
  themeColor: 'Bocchi',
  blurAmount: 2,
  cardLayout: 'grid',
};

const useCustomSetting = (): [
  UserPreferences,
  (newValue: Partial<UserPreferences>) => void,
] => {
  const [customSetting, setUserPreferences] =
    useState<UserPreferences>(DefaultPreferences);
  const setCustomSetting = (newValue: Partial<UserPreferences>) => {
    setUserPreferences((prev) => {
      const updated = { ...prev, ...newValue };
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      window.dispatchEvent(new Event('storagePreferences'));
      return updated;
    });
  };

  useEffect(() => {
    const data = localStorage.getItem('user_preferences');
    if (data) {
      setUserPreferences(JSON.parse(data));
    }
  }, []);

  return [customSetting, setCustomSetting];
};

export default useCustomSetting;
