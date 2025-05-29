import { Theme, responsiveFontSizes } from '@mui/material';
import { createTheme, ComponentsOverrides } from '@mui/material/styles';
import shadows from './shadows';
import palette from './palette';
import { ThemeMode } from '../types/setting';

const getTheme = (
  mode: string,
  color: string,
  themeToggler: (mode: ThemeMode) => void,
  colorToggler: (color: string) => void,
): Theme => {
  console.log('Change Theme', mode, color);
  window.electron.ipcRenderer.sendMessage('theme-change', palette[color][mode]);
  return responsiveFontSizes(
    createTheme({
      palette: palette[color][mode],
      shadows: shadows(mode),
      typography: {
        button: {
          textTransform: 'none',
          fontWeight: 'medium' as React.CSSProperties['fontWeight'],
        },
      },
      zIndex: {
        appBar: 1200,
        drawer: 1300,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontWeight: 400,
              borderRadius: 5,
              paddingTop: 10,
              paddingBottom: 10,
            },
            containedSecondary: mode === 'light' ? { color: 'white' } : {},
          } as ComponentsOverrides['MuiButton'],
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              borderRadius: 5,
            },
          } as ComponentsOverrides['MuiInputBase'],
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 5,
            },
            input: {
              borderRadius: 5,
            },
          } as ComponentsOverrides['MuiOutlinedInput'],
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          } as ComponentsOverrides['MuiCard'],
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: palette[color][mode].background.default,
            },
          } as ComponentsOverrides['MuiPaper'],
        },
      },
      themeToggler,
      colorToggler,
    }),
  );
};

export default getTheme;
