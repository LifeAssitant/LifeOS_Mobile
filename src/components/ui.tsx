import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { THEMES, ThemeName, clayAccent, clayInset, clayRaised, spacing } from "../theme/tokens";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.bg,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Raised clay card. */
export function Panel({
  children,
  style,
  tone,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** playful tints the card; professional keeps every card monochrome */
  tone?: "mint" | "peach" | "sky" | "lilac" | "accent";
}) {
  const { colors, radii, theme } = useTheme();
  const tinted =
    theme === "playful" && tone
      ? tone === "mint"
        ? colors.mintSoft
        : tone === "peach"
          ? colors.peachSoft
          : tone === "sky"
            ? colors.skySoft
            : tone === "lilac"
              ? colors.lilacSoft
              : colors.accentSoft
      : colors.surface;

  return (
    <View
      style={[
        clayRaised(colors, { radius: radii.lg, background: tinted }),
        { padding: spacing.md },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Carved-in surface used for inputs, calendars and segmented controls. */
export function Well({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors, radii } = useTheme();
  return <View style={[clayInset(colors, { radius: radii.md }), style]}>{children}</View>;
}

/** The LifeOS mark: a puffy rounded square in the active accent. */
export function CompanionFace({ size = 40 }: { size?: number }) {
  const { colors } = useTheme();
  const dot = Math.max(3, size * 0.1);
  return (
    <View
      style={[
        clayAccent(colors, { radius: size * 0.32, lift: size * 0.16 }),
        { width: size, height: size, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <View style={{ flexDirection: "row", gap: size * 0.14, marginBottom: size * 0.08 }}>
        <View
          style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: colors.accentInk }}
        />
        <View
          style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: colors.accentInk }}
        />
      </View>
      <View
        style={{
          width: size * 0.34,
          height: size * 0.14,
          borderBottomLeftRadius: size,
          borderBottomRightRadius: size,
          borderWidth: Math.max(1.5, size * 0.055),
          borderTopWidth: 0,
          borderColor: colors.accentInk,
        }}
      />
    </View>
  );
}

export function BrandMark({ subtitle }: { subtitle?: string }) {
  const { colors, type } = useTheme();
  return (
    <View style={{ alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm }}>
      <CompanionFace size={52} />
      <Text style={[type.display, { color: colors.ink }]}>LifeOS</Text>
      {subtitle ? (
        <Text style={[type.body, { color: colors.muted, textAlign: "center" }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors, radii, type } = useTheme();
  const isPrimary = variant === "primary";
  const textColor = isPrimary
    ? colors.accentInk
    : variant === "danger"
      ? colors.danger
      : colors.ink;

  const base = isPrimary
    ? clayAccent(colors, { radius: radii.md })
    : clayRaised(colors, {
        radius: radii.md,
        lift: 6,
        background: variant === "danger" ? colors.dangerSoft : colors.surface,
      });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        base,
        {
          paddingVertical: 13,
          paddingHorizontal: 18,
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        },
        pressed
          ? {
              transform: [{ scale: 0.98 }],
              shadowOpacity: 0,
              elevation: 0,
              borderTopColor: colors.clayLo,
              borderBottomColor: colors.clayHi,
            }
          : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[type.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function PillButton({
  label,
  onPress,
  active,
  icon,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  const { colors, type } = useTheme();
  const base = active
    ? clayAccent(colors, { radius: 999, lift: 6 })
    : clayRaised(colors, { radius: 999, lift: 6 });
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        base,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          paddingVertical: 9,
          paddingHorizontal: 14,
        },
        pressed ? { transform: [{ scale: 0.98 }] } : null,
      ]}
    >
      {icon}
      <Text style={[type.caption, { color: active ? colors.accentInk : colors.inkSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label?: string }) {
  const { label, style, ...rest } = props;
  const { colors, radii, type, fonts } = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[type.caption, { color: colors.muted, marginBottom: 6 }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          clayInset(colors, { radius: radii.md }) as TextStyle,
          {
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.ink,
            fontSize: 15,
            fontFamily: fonts.body,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  const { colors, type } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm }}>
      <CompanionFace size={56} />
      <Text style={[type.title, { color: colors.ink }]}>{title}</Text>
      <Text style={[type.body, { color: colors.muted, textAlign: "center" }]}>{body}</Text>
    </View>
  );
}

export function Chip({ label, onPress }: { label: string; onPress?: () => void }) {
  const { colors, type } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        clayRaised(colors, { radius: 999, lift: 4 }),
        { paddingHorizontal: 12, paddingVertical: 7 },
        pressed ? { transform: [{ scale: 0.97 }] } : null,
      ]}
    >
      <Text style={[type.caption, { color: colors.inkSoft, fontSize: 11.5 }]}>{label}</Text>
    </Pressable>
  );
}

/** Two themes, exactly as on desktop: Playful and Professional. */
export function ThemeToggle() {
  const { theme, setTheme, colors, radii, type } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {THEMES.map((option) => {
        const active = option.id === theme;
        return (
          <Pressable
            key={option.id}
            onPress={() => setTheme(option.id)}
            style={({ pressed }) => [
              active
                ? clayInset(colors, { radius: radii.md, background: colors.accentSoft })
                : clayRaised(colors, { radius: radii.md, lift: 6, background: colors.surface2 }),
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 11,
                padding: 10,
              },
              pressed ? { transform: [{ scale: 0.99 }] } : null,
            ]}
          >
            <ThemeSwatch theme={option.id} />
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: colors.ink }]}>{option.label}</Text>
              <Text style={[type.caption, { color: colors.muted, fontSize: 11.5 }]}>
                {option.hint}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function ThemeSwatch({ theme }: { theme: ThemeName }) {
  const tiles =
    theme === "playful"
      ? ["#f4846f", "#45bfa3", "#edb64e", "#9b86e8"]
      : ["#0e100f", "#3a403d", "#8a938e", "#eef1ef"];
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 11,
        overflow: "hidden",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {tiles.map((tile) => (
        <View key={tile} style={{ width: "50%", height: "50%", backgroundColor: tile }} />
      ))}
    </View>
  );
}

/** Avatar in the header — opens account actions, like the desktop menu. */
export function AccountButton({
  name,
  email,
  onSettings,
  onLogout,
}: {
  name?: string | null;
  email?: string | null;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const { colors, radii, type } = useTheme();
  const [open, setOpen] = React.useState(false);
  const initial = (name || email || "U").trim().charAt(0).toUpperCase();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Account menu"
        style={({ pressed }) => [
          clayAccent(colors, { radius: 999, lift: 6 }),
          { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
          pressed ? { transform: [{ scale: 0.96 }] } : null,
        ]}
      >
        <Text style={[type.label, { color: colors.accentInk }]}>{initial}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              clayRaised(colors, { radius: radii.xl, lift: 14 }),
              { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
            ]}
          >
            <View style={{ paddingHorizontal: 6, paddingBottom: 4 }}>
              <Text style={[type.label, { color: colors.ink }]}>{name || "Account"}</Text>
              {email ? (
                <Text style={[type.caption, { color: colors.muted, marginTop: 2 }]}>{email}</Text>
              ) : null}
            </View>

            <Text style={[type.caption, { color: colors.muted, paddingHorizontal: 6 }]}>Theme</Text>
            <ThemeToggle />

            <Button
              label="Settings"
              variant="ghost"
              onPress={() => {
                setOpen(false);
                onSettings();
              }}
            />
            <Button
              label="Sign out"
              variant="danger"
              onPress={() => {
                setOpen(false);
                onLogout();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  const { colors, radii, type } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: spacing.lg }}
    >
      <View style={{ alignItems: "flex-start", marginBottom: spacing.lg }}>
        <CompanionFace size={44} />
        <Text style={[type.display, { color: colors.ink, marginTop: spacing.md }]}>{title}</Text>
        <Text style={[type.body, { color: colors.muted, marginTop: 6 }]}>{subtitle}</Text>
      </View>

      <View
        style={[
          clayRaised(colors, { radius: radii.xl, lift: 12 }),
          { padding: spacing.md, gap: spacing.sm },
        ]}
      >
        {children}
      </View>

      <View style={{ marginTop: spacing.md, alignItems: "center" }}>{footer}</View>

      <View style={{ marginTop: spacing.lg }}>
        <Text style={[type.caption, { color: colors.muted, marginBottom: 8 }]}>Theme</Text>
        <ThemeToggle />
      </View>
    </ScrollView>
  );
}
