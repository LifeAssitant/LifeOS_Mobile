import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import { Button, CompanionFace, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { colors, spacing, typography } from "../../src/theme/tokens";

export default function ReadyScreen() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    try {
      const { api } = await import("../../src/api/client");
      await api.updateMe({ onboarding_completed: true });
      await refreshUser();
      router.replace("/(tabs)/home");
    } catch (err) {
      Alert.alert("Something went wrong", err instanceof Error ? err.message : "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.center}>
      <CompanionFace size={88} />
      <Text style={styles.title}>You’re ready</Text>
      <Text style={styles.body}>Chat, calendar, tasks, and soft reminders — that’s the whole idea.</Text>
      <Button label="Enter LifeOS" onPress={finish} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center", gap: spacing.md },
  title: { ...typography.title, color: colors.ink },
  body: { ...typography.body, color: colors.muted, textAlign: "center", marginBottom: spacing.lg },
});
