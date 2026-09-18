import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { api } from "../../src/api/client";
import { Button, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { colors, radii, spacing, typography } from "../../src/theme/tokens";

export default function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [mode, setMode] = useState<"hosted" | "byok">(user?.ai_mode ?? "hosted");
  const [key, setKey] = useState("");
  const [remindBefore, setRemindBefore] = useState(String(user?.remind_before_minutes ?? 15));
  const [saving, setSaving] = useState(false);

  const saveAi = async () => {
    setSaving(true);
    try {
      await api.updateAi({
        ai_mode: mode,
        gemini_api_key: mode === "byok" ? key || undefined : undefined,
      });
      await api.updateMe({ remind_before_minutes: Number(remindBefore) || 15 });
      await refreshUser();
      Alert.alert("Saved", "Your preferences are updated.");
      setKey("");
    } catch (err) {
      Alert.alert("Could not save", err instanceof Error ? err.message : "Try again");
    } finally {
      setSaving(false);
    }
  };

  const buyCredits = async () => {
    try {
      const { checkout_url } = await api.checkout();
      await Linking.openURL(checkout_url);
    } catch (err) {
      Alert.alert("Billing", err instanceof Error ? err.message : "Stripe not configured yet");
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{user?.email}</Text>
          <Text style={styles.meta}>Credits: {user?.credit_balance ?? 0}</Text>
          <Text style={styles.meta}>
            BYOK key: {user?.has_byok_key ? "saved" : "not set"}
          </Text>
        </View>

        <Text style={styles.section}>AI mode</Text>
        <View style={styles.row}>
          <Button
            label="LifeOS API"
            variant={mode === "hosted" ? "primary" : "ghost"}
            onPress={() => setMode("hosted")}
          />
          <View style={{ height: 8 }} />
          <Button
            label="My Gemini key"
            variant={mode === "byok" ? "primary" : "ghost"}
            onPress={() => setMode("byok")}
          />
        </View>
        {mode === "byok" ? (
          <Field
            label="Gemini API key"
            value={key}
            onChangeText={setKey}
            autoCapitalize="none"
            placeholder={user?.has_byok_key ? "•••••••• (leave blank to keep)" : "AIza…"}
          />
        ) : (
          <Button label="Buy credits" variant="ghost" onPress={buyCredits} />
        )}

        <Field
          label="Remind me minutes before"
          value={remindBefore}
          onChangeText={setRemindBefore}
          keyboardType="number-pad"
        />

        <View style={styles.row}>
          <Button
            label={user?.quiet_hours_enabled ? "Quiet hours: on" : "Quiet hours: off"}
            variant="ghost"
            onPress={async () => {
              await api.updateMe({ quiet_hours_enabled: !user?.quiet_hours_enabled });
              await refreshUser();
            }}
          />
        </View>

        <Button label="Save" onPress={saveAi} loading={saving} />
        <View style={{ height: spacing.md }} />
        <Button label="Sign out" variant="danger" onPress={() => logout()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.ink, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  label: { ...typography.body, fontWeight: "700", color: colors.ink },
  meta: { ...typography.caption, color: colors.muted, marginTop: 4 },
  section: { ...typography.body, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  row: { marginBottom: spacing.md },
});
