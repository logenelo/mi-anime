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
import { ThemeProvider } from '@mui/material/styles';
import useCustomSetting from './hooks/useCustomSetting';
import { ThemeMode } from './types/setting';
import getTheme from './theme';
import RouterContext from './contexts/RouterContext';

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
  const [route, setRoute] = React.useState<string>('/');
  const routes: Record<string, JSX.Element> = {
    '/': <Home />,
    '/calendar': <Calendar />,
    '/favorites': <Favorites />,
    '/settings': <Settings />,
    '/animes': <Animes />,
  };
  const navigate = (path: string) => {
    setRoute(path);
  };
  const MainPage = () => {
    return routes?.[route] || routes['/'];
  };
  React.useEffect(() => {
    if (!Object.keys(routes).includes(route)) {
      setRoute('/');
    }
  }, [route]);
  return (
    <DetailProvider>
      <ThemeProvider theme={theme}>
        <RouterContext.Provider value={{ route, navigate }}>
          <Main>
            <MainPage />
          </Main>
        </RouterContext.Provider>
      </ThemeProvider>
    </DetailProvider>
  );
};

export default App;
