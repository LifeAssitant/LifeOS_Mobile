import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LEGACY_STYLE_KEY,
  THEME_KEY,
  ThemeColors,
  ThemeName,
  getFonts,
  getPalette,
  getRadii,
  getTypography,
  normalizeTheme,
} from "./tokens";

type ThemeContextValue = {
  theme: ThemeName;
  colors: ThemeColors;
  radii: ReturnType<typeof getRadii>;
  fonts: ReturnType<typeof getFonts>;
  type: ReturnType<typeof getTypography>;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("playful");

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored) {
          setThemeState(normalizeTheme(stored));
          return;
        }
        const legacy = await AsyncStorage.getItem(LEGACY_STYLE_KEY);
        if (legacy) setThemeState(normalizeTheme(legacy));
      } catch {
        /* keep the default */
      }
    })();
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    void AsyncStorage.setItem(THEME_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "playful" ? "professional" : "playful";
      void AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      colors: getPalette(theme),
      radii: getRadii(theme),
      fonts: getFonts(theme),
      type: getTypography(theme),
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
