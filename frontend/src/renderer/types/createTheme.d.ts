// eslint-disable-next-line @typescript-eslint/no-unused-vars
import '@mui/material/styles/createTheme';
import { ThemeMode } from '../types/setting';

declare module '@mui/material/styles/createTheme' {
  interface Theme {
    themeToggler: (mode: ThemeMode) => void;
    colorToggler: (color: string) => void;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    themeToggler?: (mode: ThemeMode) => void;
    colorToggler?: (color: string) => void;
  }
}
