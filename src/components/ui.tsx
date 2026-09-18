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

import { colors, radii, spacing, typography } from "../theme/tokens";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.brandWrap}>
      <CompanionFace size={56} />
      <Text style={styles.brand}>LifeOS</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function CompanionFace({ size = 48 }: { size?: number }) {
  return (
    <View
      style={[
        styles.face,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View style={styles.eyes}>
        <View style={styles.eye} />
        <View style={styles.eye} />
      </View>
      <View style={styles.smile} />
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
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
}) {
  const bg =
    variant === "primary"
      ? colors.peach
      : variant === "danger"
        ? colors.blush
        : "transparent";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: pressed || disabled ? 0.7 : 1 },
        variant === "ghost" && styles.buttonGhost,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <CompanionFace size={64} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
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
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  brandWrap: { alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm },
  brand: { ...typography.brand, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted, textAlign: "center" },
  face: {
    backgroundColor: colors.peachSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.peach,
  },
  eyes: { flexDirection: "row", gap: 10, marginBottom: 4 },
  eye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ink,
  },
  smile: {
    width: 16,
    height: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.ink,
  },
  button: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonText: { ...typography.body, fontWeight: "700", color: colors.ink },
  field: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.title, color: colors.ink },
  emptyBody: { ...typography.body, color: colors.muted, textAlign: "center" },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: colors.mintSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginTop: 8,
  },
  chipText: { ...typography.caption, color: colors.ink },
});
