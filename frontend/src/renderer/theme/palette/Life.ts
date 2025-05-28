import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#F5F5F5",
    dark: "#EEEEEE",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#43A047", // Nature green
    light: "#66BB6A",
    dark: "#2E7D32",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#5C6BC0", // Soft blue
    light: "#7986CB",
    dark: "#3949AB",
    contrastText: "#FFFFFF",
  },
  text: {
    primary: "#212121",
    secondary: "#424242",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#F5F5F5",
    level2: "#EEEEEE",
    level1: "#FFFFFF",
  },
};

export const dark = {
  alternate: {
    main: "#1B1B1B",
    dark: "#121212",
  },
  cardShadow: "rgba(0, 0, 0, 0.5)",
  mode: "dark" as PaletteMode,
  primary: {
    main: "#81C784", // Light green
    light: "#A5D6A7",
    dark: "#66BB6A",
    contrastText: "#000000",
  },
  secondary: {
    main: "#9FA8DA", // Light periwinkle
    light: "#C5CAE9",
    dark: "#7986CB",
    contrastText: "#000000",
  },
  text: {
    primary: "#E0E0E0",
    secondary: "#B0B0B0",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#1B1B1B",
    default: "#121212",
    level2: "#333333",
    level1: "#1B1B1B",
  },
};