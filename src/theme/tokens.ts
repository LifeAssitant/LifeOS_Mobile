import type { TextStyle, ViewStyle } from "react-native";

export type ThemeName = "playful" | "professional";

/** @deprecated use ThemeName */
export type ThemeStyle = ThemeName;
/** @deprecated the app no longer has a separate light/dark switch */
export type ColorScheme = "light" | "dark";

export type ThemeColors = {
  bg: string;
  bgSoft: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  lineSoft: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  mint: string;
  mintSoft: string;
  peach: string;
  peachSoft: string;
  sky: string;
  skySoft: string;
  lilac: string;
  lilacSoft: string;
  butter: string;
  butterSoft: string;
  danger: string;
  dangerSoft: string;
  input: string;
  /** Clay lighting: bright inner top edge, dark inner bottom edge. */
  clayHi: string;
  clayLo: string;
  onAccentHi: string;
  onAccentLo: string;
  shadowColor: string;
  shadowOpacity: number;
  /** legacy aliases kept so older call sites keep compiling */
  card: string;
  cardStrong: string;
  warm: string;
  warmSoft: string;
  well: string;
};

const playful: ThemeColors = {
  bg: "#fdf1e3",
  bgSoft: "#fffaf3",
  surface: "#fffaf4",
  surface2: "#fff3e8",
  ink: "#45384a",
  inkSoft: "#5f5068",
  muted: "#92849c",
  line: "rgba(69,56,74,0.08)",
  lineSoft: "rgba(69,56,74,0.045)",
  accent: "#f4846f",
  accentInk: "#ffffff",
  accentSoft: "#ffe0d6",
  mint: "#45bfa3",
  mintSoft: "#d2f2e8",
  peach: "#f39a78",
  peachSoft: "#ffe4d5",
  sky: "#5fa9e6",
  skySoft: "#d8eafb",
  lilac: "#9b86e8",
  lilacSoft: "#e7e0fc",
  butter: "#edb64e",
  butterSoft: "#fceecb",
  danger: "#e06a6a",
  dangerSoft: "#fbdcdc",
  input: "#fdf0e4",
  clayHi: "rgba(255,255,255,0.95)",
  clayLo: "rgba(176,138,146,0.22)",
  onAccentHi: "rgba(255,255,255,0.5)",
  onAccentLo: "rgba(120,60,50,0.22)",
  shadowColor: "#96707a",
  shadowOpacity: 0.28,
  card: "#fffaf4",
  cardStrong: "#fff3e8",
  warm: "#f4846f",
  warmSoft: "#ffe0d6",
  well: "#fdf0e4",
};

const professional: ThemeColors = {
  bg: "#0e100f",
  bgSoft: "#141716",
  surface: "#1a1e1c",
  surface2: "#212623",
  ink: "#f1f3f2",
  inkSoft: "#c6cdc9",
  muted: "#8a938e",
  line: "rgba(241,243,242,0.07)",
  lineSoft: "rgba(241,243,242,0.04)",
  accent: "#e9ece9",
  accentInk: "#141716",
  accentSoft: "#272d2a",
  mint: "#9fb3a8",
  mintSoft: "#212724",
  peach: "#b2a79c",
  peachSoft: "#26221f",
  sky: "#98a7ad",
  skySoft: "#1f2527",
  lilac: "#a4a1ad",
  lilacSoft: "#232329",
  butter: "#b8ae97",
  butterSoft: "#26231d",
  danger: "#e08585",
  dangerSoft: "#2e2020",
  input: "#151917",
  clayHi: "rgba(255,255,255,0.07)",
  clayLo: "rgba(0,0,0,0.55)",
  onAccentHi: "rgba(255,255,255,0.85)",
  onAccentLo: "rgba(0,0,0,0.18)",
  shadowColor: "#000000",
  shadowOpacity: 0.6,
  card: "#1a1e1c",
  cardStrong: "#212623",
  warm: "#e9ece9",
  warmSoft: "#272d2a",
  well: "#151917",
};

const palettes: Record<ThemeName, ThemeColors> = { playful, professional };

export function getPalette(theme: ThemeName): ThemeColors {
  return palettes[theme];
}

/** @deprecated prefer useTheme().colors */
export const colors = playful;

export const THEME_KEY = "lifeos_theme";
/** legacy keys, read once so existing installs migrate cleanly */
export const LEGACY_STYLE_KEY = "lifeos_theme_mode";
export const LEGACY_SCHEME_KEY = "lifeos_color_scheme";

export function normalizeTheme(raw: string | null): ThemeName {
  if (raw === "playful" || raw === "professional") return raw;
  if (raw === "glass" || raw === "ocean") return "professional";
  return "playful";
}

export const THEMES: Array<{ id: ThemeName; label: string; hint: string }> = [
  { id: "playful", label: "Playful", hint: "Soft pastels, rounded, bright" },
  { id: "professional", label: "Professional", hint: "Graphite, monochrome, focused" },
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Playful is rounder than professional, matching the desktop build. */
export function getRadii(theme: ThemeName) {
  return theme === "playful"
    ? { sm: 14, md: 18, lg: 26, xl: 32, pill: 999 }
    : { sm: 12, md: 16, lg: 22, xl: 26, pill: 999 };
}

/** @deprecated use getRadii(theme) */
export const radii = getRadii("playful");

export type ThemeFonts = {
  display: string;
  body: string;
  medium: string;
  semibold: string;
  bold: string;
};

export function getFonts(theme: ThemeName): ThemeFonts {
  return {
    display: theme === "playful" ? "Baloo2_700Bold" : "Outfit_600SemiBold",
    body: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semibold: "Outfit_600SemiBold",
    bold: "Outfit_700Bold",
  };
}

export function getTypography(theme: ThemeName) {
  const f = getFonts(theme);
  const displayTracking = theme === "playful" ? -0.2 : -0.6;
  return {
    display: {
      fontFamily: f.display,
      fontSize: 30,
      letterSpacing: displayTracking,
    } as TextStyle,
    title: {
      fontFamily: f.display,
      fontSize: 22,
      letterSpacing: displayTracking,
    } as TextStyle,
    heading: {
      fontFamily: f.display,
      fontSize: 17,
      letterSpacing: displayTracking,
    } as TextStyle,
    body: { fontFamily: f.body, fontSize: 15 } as TextStyle,
    bodyStrong: { fontFamily: f.semibold, fontSize: 15 } as TextStyle,
    label: { fontFamily: f.semibold, fontSize: 13 } as TextStyle,
    caption: { fontFamily: f.medium, fontSize: 12.5 } as TextStyle,
  };
}

/** @deprecated use getTypography(theme) */
export const typography = {
  brand: { fontSize: 30, fontWeight: "700" as const },
  title: { fontSize: 22, fontWeight: "700" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  caption: { fontSize: 12.5, fontWeight: "600" as const },
};

/**
 * Raised clay: bright top edge, dark bottom edge, soft drop shadow.
 * React Native has no inset shadows, so the inner lighting is faked with hairline borders.
 */
export function clayRaised(
  c: ThemeColors,
  opts?: { radius?: number; lift?: number; background?: string }
): ViewStyle {
  const lift = opts?.lift ?? 8;
  return {
    backgroundColor: opts?.background ?? c.surface,
    borderRadius: opts?.radius,
    borderTopWidth: 1,
    borderTopColor: c.clayHi,
    borderBottomWidth: 1.5,
    borderBottomColor: c.clayLo,
    shadowColor: c.shadowColor,
    shadowOpacity: c.shadowOpacity,
    shadowRadius: lift * 1.7,
    shadowOffset: { width: 0, height: Math.round(lift * 0.75) },
    elevation: Math.round(lift * 0.8),
  };
}

/** Pressed clay: the surface is carved inward, so the dark edge sits on top. */
export function clayInset(
  c: ThemeColors,
  opts?: { radius?: number; background?: string }
): ViewStyle {
  return {
    backgroundColor: opts?.background ?? c.input,
    borderRadius: opts?.radius,
    borderTopWidth: 1.5,
    borderTopColor: c.clayLo,
    borderBottomWidth: 1,
    borderBottomColor: c.clayHi,
  };
}

/** Raised clay on an accent-filled control (button, avatar, send key). */
export function clayAccent(
  c: ThemeColors,
  opts?: { radius?: number; lift?: number; background?: string }
): ViewStyle {
  const lift = opts?.lift ?? 7;
  return {
    backgroundColor: opts?.background ?? c.accent,
    borderRadius: opts?.radius,
    borderTopWidth: 1,
    borderTopColor: c.onAccentHi,
    borderBottomWidth: 1.5,
    borderBottomColor: c.onAccentLo,
    shadowColor: c.shadowColor,
    shadowOpacity: c.shadowOpacity,
    shadowRadius: lift * 1.7,
    shadowOffset: { width: 0, height: Math.round(lift * 0.75) },
    elevation: Math.round(lift * 0.8),
  };
}

/** @deprecated use clayRaised */
export function clayShadow(_style: unknown, c: ThemeColors): ViewStyle {
  return clayRaised(c);
}
