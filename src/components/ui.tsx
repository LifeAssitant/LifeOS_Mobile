import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { clayShadow, radii, spacing, typography } from "../theme/tokens";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }, style]}>
      {children}
    </View>
  );
}

export function Panel({
  children,
  style,
  soft,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  soft?: "accent" | "warm" | "sky";
}) {
  const { colors, style: themeStyle } = useTheme();
  const bg =
    soft === "accent"
      ? colors.accentSoft
      : soft === "warm"
        ? colors.warmSoft
        : soft === "sky"
          ? colors.skySoft
          : colors.card;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radii.lg,
          padding: spacing.md,
          ...clayShadow(themeStyle, colors),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function BrandMark({ subtitle }: { subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm }}>
      <CompanionFace size={56} />
      <Text style={{ ...typography.brand, color: colors.ink }}>LifeOS</Text>
      {subtitle ? (
        <Text style={{ ...typography.body, color: colors.muted, textAlign: "center" }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function CompanionFace({ size = 48 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.warmSoft,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: colors.warm,
      }}
    >
      <View style={{ flexDirection: "row", gap: size * 0.16, marginBottom: 4 }}>
        <View
          style={{
            width: Math.max(5, size * 0.1),
            height: Math.max(5, size * 0.1),
            borderRadius: 99,
            backgroundColor: colors.ink,
          }}
        />
        <View
          style={{
            width: Math.max(5, size * 0.1),
            height: Math.max(5, size * 0.1),
            borderRadius: 99,
            backgroundColor: colors.ink,
          }}
        />
      </View>
      <View
        style={{
          width: size * 0.28,
          height: size * 0.14,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          borderWidth: 2,
          borderTopWidth: 0,
          borderColor: colors.ink,
        }}
      />
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger" | "moss";
  loading?: boolean;
  disabled?: boolean;
}) {
  const { colors, style: themeStyle } = useTheme();
  const bg =
    variant === "primary"
      ? colors.warm
      : variant === "moss"
        ? colors.accent
        : variant === "danger"
          ? colors.dangerSoft
          : colors.card;
  const textColor = variant === "primary" || variant === "moss" ? "#fff" : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          borderRadius: radii.pill,
          paddingVertical: 13,
          paddingHorizontal: 18,
          alignItems: "center",
          backgroundColor: bg,
          opacity: pressed || disabled ? 0.7 : 1,
          ...clayShadow(themeStyle, colors),
        },
        variant === "ghost" && {
          borderWidth: 1,
          borderColor: colors.line,
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ ...typography.body, fontWeight: "700", color: textColor }}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  const { colors, style: themeStyle } = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          ...typography.caption,
          color: colors.muted,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          {
            backgroundColor: colors.input,
            borderRadius: radii.md,
            borderWidth: themeStyle === "glass" ? 1 : 0,
            borderColor: colors.glassBorder,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.ink,
            fontSize: 16,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm }}>
      <CompanionFace size={64} />
      <Text style={{ ...typography.title, color: colors.ink }}>{title}</Text>
      <Text style={{ ...typography.body, color: colors.muted, textAlign: "center" }}>{body}</Text>
    </View>
  );
}

export function Chip({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignSelf: "flex-start",
        backgroundColor: colors.accentSoft,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radii.pill,
        marginTop: 8,
      }}
    >
      <Text style={{ ...typography.caption, color: colors.ink }}>{label}</Text>
    </Pressable>
  );
}

export function ThemeToggle() {
  const { style, scheme, setStyle, setScheme, colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Segment
        options={[
          { key: "clay", label: "Clay" },
          { key: "glass", label: "Glass" },
        ]}
        value={style}
        onChange={(v) => setStyle(v as "clay" | "glass")}
        colors={colors}
      />
      <Segment
        options={[
          { key: "light", label: "Light" },
          { key: "dark", label: "Dark" },
        ]}
        value={scheme}
        onChange={(v) => setScheme(v as "light" | "dark")}
        colors={colors}
      />
    </View>
  );
}

function Segment({
  options,
  value,
  onChange,
  colors,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.well,
        borderRadius: radii.pill,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: active ? colors.card : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: active ? colors.ink : colors.muted,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { colors, style: themeStyle } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", paddingVertical: spacing.lg }}>
      <View
        style={{
          backgroundColor: colors.warmSoft,
          borderRadius: radii.xl,
          padding: spacing.lg,
          ...clayShadow(themeStyle, colors),
        }}
      >
        <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
          <CompanionFace size={56} />
          <Text style={{ ...typography.brand, color: colors.ink, marginTop: 12 }}>LifeOS</Text>
          <Text
            style={{
              ...typography.body,
              color: colors.muted,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {subtitle}
          </Text>
        </View>
        <Text
          style={{
            ...typography.title,
            color: colors.ink,
            textAlign: "center",
            marginBottom: spacing.md,
            fontSize: 20,
          }}
        >
          {title}
        </Text>
        {children}
        <View style={{ marginTop: spacing.md, alignItems: "center" }}>{footer}</View>
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <ThemeToggle />
      </View>
    </View>
  );
}

// Keep StyleSheet import used for any residual static styles
void StyleSheet;
