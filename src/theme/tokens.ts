export type ThemeStyle = "clay" | "glass";
export type ColorScheme = "light" | "dark";

export type ThemeColors = {
  bg: string;
  bgSoft: string;
  bgDeep: string;
  card: string;
  cardStrong: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  warm: string;
  warmSoft: string;
  skySoft: string;
  danger: string;
  dangerSoft: string;
  shadow: string;
  highlight: string;
  shade: string;
  well: string;
  input: string;
  glassBorder: string;
};

const palettes: Record<ThemeStyle, Record<ColorScheme, ThemeColors>> = {
  clay: {
    light: {
      bg: "#ede8e2",
      bgSoft: "#f7f4ef",
      bgDeep: "#e4ddd4",
      card: "#fffcfa",
      cardStrong: "#fff8f3",
      ink: "#1c1917",
      muted: "#78716c",
      line: "rgba(28,25,23,0.1)",
      accent: "#3d8b74",
      accentSoft: "#d7ede5",
      warm: "#d4895a",
      warmSoft: "#f3e0d2",
      skySoft: "#dce8ef",
      danger: "#c45c5c",
      dangerSoft: "#f0d4d4",
      shadow: "rgba(28,25,23,0.09)",
      highlight: "rgba(255,255,255,0.78)",
      shade: "rgba(28,25,23,0.055)",
      well: "rgba(237,232,226,0.55)",
      input: "#f0ebe5",
      glassBorder: "transparent",
    },
    dark: {
      bg: "#1a1816",
      bgSoft: "#24211e",
      bgDeep: "#121110",
      card: "#2c2825",
      cardStrong: "#322e2a",
      ink: "#f5f0ea",
      muted: "#a8a29e",
      line: "rgba(245,240,234,0.1)",
      accent: "#5cb89a",
      accentSoft: "#1e3d34",
      warm: "#e09a6a",
      warmSoft: "#3d2e24",
      skySoft: "#1e2c35",
      danger: "#e07a7a",
      dangerSoft: "#3d2424",
      shadow: "rgba(0,0,0,0.45)",
      highlight: "rgba(255,255,255,0.08)",
      shade: "rgba(0,0,0,0.35)",
      well: "rgba(18,17,16,0.55)",
      input: "#221f1c",
      glassBorder: "rgba(255,255,255,0.08)",
    },
  },
  glass: {
    light: {
      bg: "#e8eef2",
      bgSoft: "#f3f6f8",
      bgDeep: "#dde7ed",
      card: "rgba(255,252,250,0.85)",
      cardStrong: "rgba(255,255,255,0.92)",
      ink: "#152028",
      muted: "#6b7c88",
      line: "rgba(21,32,40,0.1)",
      accent: "#3d8b74",
      accentSoft: "rgba(61,139,116,0.18)",
      warm: "#d4895a",
      warmSoft: "rgba(212,137,90,0.18)",
      skySoft: "rgba(90,143,173,0.2)",
      danger: "#c45c5c",
      dangerSoft: "rgba(196,92,92,0.18)",
      shadow: "rgba(28,40,50,0.1)",
      highlight: "rgba(255,255,255,0.65)",
      shade: "rgba(28,40,50,0.06)",
      well: "rgba(255,255,255,0.35)",
      input: "rgba(255,255,255,0.5)",
      glassBorder: "rgba(255,255,255,0.55)",
    },
    dark: {
      bg: "#0c1218",
      bgSoft: "#141c26",
      bgDeep: "#080c10",
      card: "rgba(24,32,44,0.88)",
      cardStrong: "rgba(32,42,56,0.92)",
      ink: "#eef4f8",
      muted: "#8fa0ad",
      line: "rgba(238,244,248,0.12)",
      accent: "#5cb89a",
      accentSoft: "rgba(92,184,154,0.2)",
      warm: "#e09a6a",
      warmSoft: "rgba(224,154,106,0.2)",
      skySoft: "rgba(107,168,201,0.22)",
      danger: "#e07a7a",
      dangerSoft: "rgba(224,122,122,0.2)",
      shadow: "rgba(0,0,0,0.45)",
      highlight: "rgba(255,255,255,0.12)",
      shade: "rgba(0,0,0,0.3)",
      well: "rgba(8,12,18,0.45)",
      input: "rgba(12,18,26,0.55)",
      glassBorder: "rgba(255,255,255,0.14)",
    },
  },
};

/** @deprecated Prefer useTheme().colors — defaults to clay light */
export const colors = palettes.clay.light;

export function getPalette(style: ThemeStyle, scheme: ColorScheme): ThemeColors {
  return palettes[style][scheme];
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
};

export const typography = {
  brand: {
    fontFamily: "System",
    fontSize: 36,
    fontWeight: "700" as const,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: "System",
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: "System",
    fontSize: 15,
    fontWeight: "400" as const,
  },
  caption: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "600" as const,
  },
};

export const THEME_STYLE_KEY = "lifeos_theme_mode";
export const THEME_SCHEME_KEY = "lifeos_color_scheme";

export function clayShadow(style: ThemeStyle, c: ThemeColors) {
  if (style === "glass") {
    return {
      borderWidth: 1,
      borderColor: c.glassBorder,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    };
  }
  return {
    borderWidth: 0,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  };
}
