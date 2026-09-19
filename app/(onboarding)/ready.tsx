import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";

import { Button, CompanionFace, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, typography } from "../../src/theme/tokens";

export default function ReadyScreen() {
  const { refreshUser } = useAuth();
  const { colors } = useTheme();
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
    <Screen style={{ justifyContent: "center", alignItems: "center", gap: spacing.md }}>
      <CompanionFace size={88} />
      <Text style={{ ...typography.title, color: colors.ink }}>You’re ready</Text>
      <Text
        style={{
          ...typography.body,
          color: colors.muted,
          textAlign: "center",
          marginBottom: spacing.lg,
        }}
      >
        Chat, Plan, tasks, and soft reminders — that’s the whole idea.
      </Text>
      <Button label="Enter LifeOS" onPress={() => void finish()} loading={loading} />
    </Screen>
  );
}
