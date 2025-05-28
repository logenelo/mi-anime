import { PaletteMode } from "@mui/material";

export const light = {
  alternate: {
    main: "#FFF5F5",
    dark: "#F5E8E8",
  },
  cardShadow: "rgba(0, 0, 0, 0.1)",
  mode: "light" as PaletteMode,
  primary: {
    main: "#E8A7A1", // Soft peach/pink
    light: "#F5D1CD",
    dark: "#DB8E86",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#A7C4E8", // Soft complementary blue
    light: "#D1E0F5",
    dark: "#86A8DB",
    contrastText: "#000000",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  background: {
    paper: "#FFFFFF",
    default: "#FFF5F5",
    level2: "#F5E8E8",
    level1: "#FFFFFF",
  },
};

export const dark = {
  alternate: {
    main: "#1A0A0A",
    dark: "#100505",
  },
  cardShadow: "rgba(0, 0, 0, 0.5)",
  mode: "dark" as PaletteMode,
  primary: {
    main: "#E8A7A1",
    light: "#F5D1CD",
    dark: "#DB8E86",
    contrastText: "#000000",
  },
  secondary: {
    main: "#A7C4E8",
    light: "#D1E0F5",
    dark: "#86A8DB",
    contrastText: "#000000",
  },
  text: {
    primary: "#FFE0E0",
    secondary: "#FFB0B0",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: "#1A0A0A",
    default: "#100505",
    level2: "#2E1A1A",
    level1: "#1A0A0A",
  },
};