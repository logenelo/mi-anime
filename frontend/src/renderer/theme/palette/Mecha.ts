import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#ECEFF1",
    dark: "#CFD8DC",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#607D8B", // Steel blue
    light: "#90A4AE",
    dark: "#455A64",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#F44336", // Alert red
    light: "#EF5350",
    dark: "#D32F2F",
    contrastText: "#FFFFFF",
  },
  text: {
    primary: "#263238",
    secondary: "#546E7A",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#ECEFF1",
    level2: "#CFD8DC",
    level1: "#FFFFFF",
  },
};

export const dark = {
  alternate: {
    main: "#212121",
    dark: "#1A1A1A",
  },
  cardShadow: "rgba(0, 0, 0, 0.5)",
  mode: "dark" as PaletteMode,
  primary: {
    main: "#90A4AE", // Light steel
    light: "#B0BEC5",
    dark: "#607D8B",
    contrastText: "#000000",
  },
  secondary: {
    main: "#FF5252", // Bright red
    light: "#FF867F",
    dark: "#FF1744",
    contrastText: "#000000",
  },
  text: {
    primary: "#E0E0E0",
    secondary: "#B0B0B0",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#212121",
    default: "#1A1A1A",
    level2: "#424242",
    level1: "#212121",
  },
};