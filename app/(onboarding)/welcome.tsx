import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, CompanionFace, Panel, Screen } from "../../src/components/ui";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, typography } from "../../src/theme/tokens";

const steps = [
  {
    title: "Talk it out",
    body: "Tell LifeOS what you need to do. It turns words into clear tasks.",
  },
  {
    title: "See your plan",
    body: "Everything lands on a simple month view — no clutter, just what’s next.",
  },
  {
    title: "Gentle nudges",
    body: "Background reminders when something’s due or still open.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Screen>
      <CompanionFace size={72} />
      <Text style={{ ...typography.title, color: colors.ink, marginTop: spacing.md, marginBottom: spacing.lg }}>
        Welcome to LifeOS
      </Text>
      <View style={{ flex: 1, gap: spacing.md }}>
        {steps.map((step) => (
          <Panel key={step.title}>
            <Text style={{ ...typography.body, fontWeight: "700", color: colors.ink, marginBottom: 4 }}>
              {step.title}
            </Text>
            <Text style={{ ...typography.body, color: colors.muted }}>{step.body}</Text>
          </Panel>
        ))}
      </View>
      <Button label="Continue" onPress={() => router.push("/(onboarding)/ready")} />
    </Screen>
  );
}
