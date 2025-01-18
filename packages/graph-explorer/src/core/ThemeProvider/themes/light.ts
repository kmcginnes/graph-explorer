import type { ProcessedTheme } from "@/core/ThemeProvider/types";

const spacing = (scale: number) => `${scale * 4}px`;

const grey = {
  100: "hsl(var(--color-gray-100))",
  200: "hsl(var(--color-gray-200))",
  300: "hsl(var(--color-gray-300))",
  400: "hsl(var(--color-gray-400))",
  500: "hsl(var(--color-gray-500))",
  600: "hsl(var(--color-gray-600))",
  700: "hsl(var(--color-gray-700))",
  800: "hsl(var(--color-gray-800))",
  900: "hsl(var(--color-gray-900))",
};

const palette: DeepRequired<ProcessedTheme["palette"]> = {
  common: {
    white: "rgb(var(--color-white))",
    black: "rgb(var(--color-black))",
  },
  primary: {
    light: "hsl(var(--color-primary-light))",
    main: "hsl(var(--color-primary-main))",
    dark: "hsl(var(--color-primary-dark))",
    contrastText: "#ffffff",
  },
  secondary: {
    light: "hsl(var(--color-secondary-light))",
    main: "hsl(var(--color-secondary-main))",
    dark: "hsl(var(--color-secondary-dark))",
    contrastText: "#ffffff",
  },
  info: {
    light: "hsl(var(--color-info-light))",
    main: "hsl(var(--color-info-main))",
    dark: "hsl(var(--color-info-dark))",
    contrastText: "#ffffff",
  },
  error: {
    light: "hsl(var(--color-error-light))",
    main: "hsl(var(--color-error-main))",
    dark: "hsl(var(--color-error-dark))",
    contrastText: "#ffffff",
  },
  success: {
    light: "hsl(var(--color-success-light))",
    main: "hsl(var(--color-success-main))",
    dark: "hsl(var(--color-success-dark))",
    contrastText: "#ffffff",
  },
  warning: {
    light: "hsl(var(--color-warning-light))",
    main: "hsl(var(--color-warning-main))",
    dark: "hsl(var(--color-warning-dark))",
    contrastText: "#ffffff",
  },
  text: {
    primary: "hsl(var(--color-text-primary))",
    secondary: "hsl(var(--color-text-secondary))",
    disabled: "hsl(var(--color-text-disabled))",
  },
  divider: "hsl(var(--color-divider))",
  border: "hsl(var(--color-border))",
  background: {
    default: "hsl(var(--color-background-default))",
    secondary: "hsl(var(--color-background-secondary))",
    contrast: "hsl(var(--color-background-contrast))",
    contrastSecondary: "hsl(var(--color-background-contrast-secondary))",
    input: "hsl(var(--color-input-background))",
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
