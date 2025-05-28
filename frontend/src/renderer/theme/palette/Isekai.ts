import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#F0F9FF",
    dark: "#E6F4FF",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#4A148C", // Deep purple
    light: "#7B1FA2",
    dark: "#311B92",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#009688", // Teal
    light: "#4DB6AC",
    dark: "#00796B",
    contrastText: "#FFFFFF",
  },
  text: {
    primary: "#212121",
    secondary: "#424242",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#F0F9FF",
    level2: "#E0F2F1",
    level1: "#FFFFFF",
  },
};

export const dark = {
  alternate: {
    main: "#1A1A2E",
    dark: "#16213E",
  },
  cardShadow: "rgba(0, 0, 0, 0.5)",
  mode: "dark" as PaletteMode,
  primary: {
    main: "#BA68C8", // Soft purple
    light: "#CE93D8",
    dark: "#9C27B0",
    contrastText: "#000000",
  },
  secondary: {
    main: "#4DB6AC", // Light teal
    light: "#80CBC4",
    dark: "#26A69A",
    contrastText: "#000000",
  },
  text: {
    primary: "#E0E0FF",
    secondary: "#B0B0FF",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#1A1A2E",
    default: "#16213E",
    level2: "#0F3460",
    level1: "#1A1A2E",
  },
};