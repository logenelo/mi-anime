import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#F8F4FF",
    dark: "#F0E8FF",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#FF3D00", // Vibrant orange-red
    light: "#FF6E40",
    dark: "#DD2C00",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#2962FF", // Bright blue
    light: "#448AFF",
    dark: "#0039CB",
    contrastText: "#FFFFFF",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#F8F4FF",
    level2: "#F5F5F5",
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
    main: "#FF3D00",
    light: "#FF6E40",
    dark: "#DD2C00",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#00B0FF",
    light: "#40C4FF",
    dark: "#0081CB",
    contrastText: "#000000",
  },
  text: {
    primary: "#E0E0E0",
    secondary: "#B0B0B0",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#1A1A2E",
    default: "#16213E",
    level2: "#0F3460",
    level1: "#1A1A2E",
  },
};