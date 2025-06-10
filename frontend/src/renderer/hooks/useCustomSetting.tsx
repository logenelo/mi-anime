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
  const [customSetting, setUserPreferences] = useState<UserPreferences>(
    localStorage.getItem('user_preferences')
      ? JSON.parse(localStorage.getItem('user_preferences') as string)
      : DefaultPreferences,
  );
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
