import { useAtomValue } from "jotai";
import { type PropsWithChildren, useEffect } from "react";

import { themeAtom } from "./StateProvider/storageAtoms";

/** Syncs the theme atom to the `dark` class on the document element. */
export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return children;
}
