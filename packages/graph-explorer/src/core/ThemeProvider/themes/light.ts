import type { ProcessedTheme } from "../types";

const spacing = (scale: number) => `${scale * 4}px`;

const grey = {
  100: "#f4f4f5",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
};

const palette: DeepRequired<ProcessedTheme["palette"]> = {
  common: {
    white: "#fff",
    black: "#000",
  },
  primary: {
    light: "#38bdf8",
    main: "#0ea5e9",
    dark: "#0284c7",
    contrastText: "#ffffff",
  },
  secondary: {
    light: "#ffb82e",
    main: "#fa8500",
    dark: "#e46000",
    contrastText: "#ffffff",
  },
  info: {
    light: "#7dd3fc",
    main: "#0ea5e9",
    dark: "#0369a1",
    contrastText: "#ffffff",
  },
  error: {
    main: "#eb4e4c",
    light: "#ff9077",
    dark: "#a41c1b",
    contrastText: "#ffffff",
  },
  success: {
    main: "#27af8c",
    light: "#31deb2",
    dark: "#129271",
    contrastText: "#ffffff",
  },
  warning: {
    light: "#ffb82e",
    main: "#fa8500",
    dark: "#e46000",
    contrastText: "#ffffff",
  },
  text: {
    primary: "#0a0a0a",
    secondary: "#404040",
    disabled: "#78716c",
  },
  divider: grey["200"],
  border: grey["200"],
  background: {
    default: "#ffffff",
    secondary: "#f0f9ff",
    contrast: grey["100"],
    contrastSecondary: grey["200"],
  },
  grey,
};

const LIGHT_THEME: ProcessedTheme = {
  name: "DEFAULT",
  mode: "light",
  spacing: {
    base: spacing(1),
    "2x": spacing(2),
    "3x": spacing(3),
    "4x": spacing(4),
    "5x": spacing(5),
    "6x": spacing(6),
  },
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    none: "none",
    left: "-4px 1px 5px 0 rgba(0, 0, 0, 0.1)",
    right: "4px 1px 5px 0 rgba(0, 0, 0, 0.1)",
  },
  palette,
  zIndex: {
    appBar: 1000,
    panes: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
  },
  typography: {
    fontSize: "14px",
    fontFamily: `"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif`,
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },
    weight: {
      light: 400,
      base: 500,
      bold: 600,
      extraBold: 700,
    },
  },
  shape: {
    borderRadius: "5px",
  },
};

export default LIGHT_THEME;
