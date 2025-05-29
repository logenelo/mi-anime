import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Home, Calendar, Favorites, Settings, Animes } from './pages';
import Main from './components/Main';

import './App.css';
import { initDB } from 'react-indexed-db-hook';
import { DBConfig } from './DBConfig';
import { DetailProvider } from './contexts/AnimeDetailContext';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import useCustomSetting from './hooks/useCustomSetting';
import { ThemeMode } from './types/setting';
import getTheme from './theme';

initDB(DBConfig);

export const useDarkMode = (): [
  ThemeMode,
  string,
  (mode: ThemeMode) => void,
  (color: string) => void,
  boolean,
] => {
  const [themeMode, setTheme] = React.useState<ThemeMode>('light');
  const [themeColor, setThemeColor] = React.useState<string>('Bocchi');
  const [mountedComponent, setMountedComponent] = React.useState(false);
  const [customSetting, setCustomSetting] = useCustomSetting();

  const themeToggler = (mode: ThemeMode): void => {
    setCustomSetting({ theme: mode });
    setTheme(mode);
  };
  const colorToggler = (color: string): void => {
    setCustomSetting({ themeColor: color });
    setThemeColor(color);
  };

  React.useEffect(() => {
    try {
      const localTheme = customSetting.theme;
      localTheme ? setTheme(localTheme) : themeToggler('light');

      const localColor = customSetting.themeColor;
      localColor ? setThemeColor(localColor) : colorToggler('Bocchi');
    } catch {
      themeToggler('light');
      colorToggler('Bocchi');
    }

    setMountedComponent(true);
  }, []);

  return [themeMode, themeColor, themeToggler, colorToggler, mountedComponent];
};

const App: React.FC = () => {
  const [themeMode, themeColor, themeToggler, colorToggler] = useDarkMode();
  const theme = getTheme(themeMode, themeColor, themeToggler, colorToggler);

  return (
    <Router>
      <Routes>
        <Route
          element={
            <DetailProvider>
              <ThemeProvider theme={theme}>
                <Main>
                  <Outlet />
                </Main>
              </ThemeProvider>
            </DetailProvider>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/animes" element={<Animes />} />
          {/* Redirect any unknown paths to the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
