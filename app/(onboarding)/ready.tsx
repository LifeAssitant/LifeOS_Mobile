import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button, CompanionFace, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing } from "../../src/theme/tokens";

export default function ReadyScreen() {
  const { refreshUser } = useAuth();
  const { colors, type } = useTheme();
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
      <CompanionFace size={72} />
      <Text style={[type.display, { color: colors.ink }]}>You’re ready</Text>
      <Text
        style={[
          type.body,
          {
            color: colors.muted,
            textAlign: "center",
            marginBottom: spacing.lg,
            lineHeight: 22,
            maxWidth: 300,
          },
        ]}
      >
        Chat, plan, tasks and quiet reminders — that is the whole idea.
      </Text>
      <View style={{ alignSelf: "stretch", paddingHorizontal: spacing.lg }}>
        <Button label="Start using LifeOS" onPress={() => void finish()} loading={loading} />
      </View>
    </Screen>
  );
}
