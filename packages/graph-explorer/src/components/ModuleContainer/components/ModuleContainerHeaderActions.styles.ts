import { css } from "@emotion/css";
import type { ThemeStyleFn } from "../../../core";

const defaultStyles =
  (pfx: string): ThemeStyleFn =>
  ({ theme }) => css`
    &.${pfx}-module-container-header-actions {
      height: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    &.${pfx}-module-container-header-actions > * {
      margin-right: ${theme.spacing.base};
    }
  `;

export default defaultStyles;

export const buttonMenuListItem =
  (pfx: string): ThemeStyleFn =>
  ({ theme }) => css`
    font-size: ${theme.typography.sizes?.xs};
    padding-right: ${theme.spacing["2x"]};

    .${pfx}-content {
      min-height: 28px;
      height: 28px;
    }
  `;
