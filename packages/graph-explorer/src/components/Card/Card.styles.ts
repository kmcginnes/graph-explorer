import { css } from "@emotion/css";
import type { ProcessedTheme, ThemeStyleFn } from "@/core";

type DefaultStylesProps = {
  disablePadding?: boolean;
  isDarkTheme?: boolean;
  transparent?: boolean;
};

const getStylesByElevation = (
  theme: ProcessedTheme,
  isDarkTheme?: boolean
) => css`
  box-shadow: ${!isDarkTheme ? theme.shadow.base : "none"};
  &.card-elevation-1 {
    background-color: ${isDarkTheme
      ? theme.palette.background.secondary
      : theme.palette.background.default};
  }
`;

const defaultStyles =
  ({ transparent }: DefaultStylesProps): ThemeStyleFn =>
  ({ theme, isDarkTheme }) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
    color: ${theme.palette.text.primary};
    border-radius: ${theme.shape.borderRadius};
    padding: ${theme.spacing["2x"]};
    background-color: ${theme.palette.background.default};
    box-shadow: ${!isDarkTheme ? theme.shadow.base : "none"};
    border: 1px solid ${isDarkTheme ? theme.palette.border : "transparent"};
    ${!transparent && getStylesByElevation(theme, isDarkTheme)}
  `;

export default defaultStyles;
