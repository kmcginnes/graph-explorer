import { css } from "@emotion/css";
import type { ThemeStyleFn } from "../../core";

const defaultStyles =
  (pfx: string): ThemeStyleFn =>
  ({ theme, isDarkTheme }) => css`
    &.${pfx}-module-container {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      color: ${theme.palette.text.secondary};

      > .${pfx}-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
      }

      &.${pfx}-variant-widget {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        box-shadow: none;
        border: none;
      }

      .${pfx}-loading {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;

        svg {
          width: 48px;
          height: 48px;
        }
      }
    }
  `;

export default defaultStyles;
