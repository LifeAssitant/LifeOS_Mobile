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
  ColorScheme,
  THEME_SCHEME_KEY,
  THEME_STYLE_KEY,
  ThemeColors,
  ThemeStyle,
  getPalette,
} from "./tokens";

type ThemeContextValue = {
  style: ThemeStyle;
  scheme: ColorScheme;
  colors: ThemeColors;
  setStyle: (style: ThemeStyle) => void;
  setScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyleState] = useState<ThemeStyle>("clay");
  const [scheme, setSchemeState] = useState<ColorScheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          AsyncStorage.getItem(THEME_STYLE_KEY),
          AsyncStorage.getItem(THEME_SCHEME_KEY),
        ]);
        if (s === "clay" || s === "glass") setStyleState(s);
        if (c === "light" || c === "dark") setSchemeState(c);
      } catch {
        /* ignore */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setStyle = useCallback((next: ThemeStyle) => {
    setStyleState(next);
    void AsyncStorage.setItem(THEME_STYLE_KEY, next);
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    void AsyncStorage.setItem(THEME_SCHEME_KEY, next);
  }, []);

  const colors = useMemo(() => getPalette(style, scheme), [style, scheme]);

  const value = useMemo(
    () => ({ style, scheme, colors, setStyle, setScheme }),
    [style, scheme, colors, setStyle, setScheme]
  );

  if (!ready) {
    return (
      <ThemeContext.Provider
        value={{
          style: "clay",
          scheme: "light",
          colors: getPalette("clay", "light"),
          setStyle,
          setScheme,
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
