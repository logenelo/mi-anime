import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#F5F5FF",
    dark: "#E8EAF6",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#00E5FF", // Cyan
    light: "#6FF9FF",
    dark: "#00B2CC",
    contrastText: "#000000",
  },
  secondary: {
    main: "#FF4081", // Hot pink
    light: "#FF79B0",
    dark: "#F50057",
    contrastText: "#000000",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#F5F5FF",
    level2: "#E8EAF6",
    level1: "#FFFFFF",
  },
};

export const dark = {
  alternate: {
    main: "#0A0A1A",
    dark: "#050510",
  },
  cardShadow: "rgba(0, 0, 0, 0.5)",
  mode: "dark" as PaletteMode,
  primary: {
    main: "#00E5FF",
    light: "#6FF9FF",
    dark: "#00B2CC",
    contrastText: "#000000",
  },
  secondary: {
    main: "#FF4081",
    light: "#FF79B0",
    dark: "#F50057",
    contrastText: "#000000",
  },
  text: {
    primary: "#E0E0FF",
    secondary: "#B0B0FF",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#0A0A1A",
    default: "#050510",
    level2: "#1A1A2E",
    level1: "#0A0A1A",
  },
};