import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#FFF5F5",
    dark: "#FFEBEE",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#E91E63", // Pink
    light: "#F06292",
    dark: "#C2185B",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#7C4DFF", // Lavender
    light: "#B388FF",
    dark: "#651FFF",
    contrastText: "#FFFFFF",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#FFF5F5",
    level2: "#FCE4EC",
    level1: "#FFFFFF",
  },
};

export const dark = {
  alternate: {
    main: "#2D142C",
    dark: "#1E0E1E",
  },
  cardShadow: "rgba(0, 0, 0, 0.5)",
  mode: "dark" as PaletteMode,
  primary: {
    main: "#FF80AB",
    light: "#FFB2DD",
    dark: "#F50057",
    contrastText: "#000000",
  },
  secondary: {
    main: "#B388FF",
    light: "#E7B9FF",
    dark: "#7C4DFF",
    contrastText: "#000000",
  },
  text: {
    primary: "#FCE4EC",
    secondary: "#D1C4E9",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#2D142C",
    default: "#1E0E1E",
    level2: "#3E1F3E",
    level1: "#2D142C",
  },
};