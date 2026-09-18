import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button, CompanionFace, Screen } from "../../src/components/ui";
import { colors, spacing, typography } from "../../src/theme/tokens";

const steps = [
  {
    title: "Talk it out",
    body: "Tell LifeOS what you need to do. It turns words into clear tasks.",
  },
  {
    title: "See your day",
    body: "Everything lands on a simple calendar — no clutter, just what’s next.",
  },
  {
    title: "Gentle nudges",
    body: "Background reminders when something’s due or still open.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  return (
    <Screen>
      <CompanionFace size={72} />
      <Text style={styles.brand}>Welcome to LifeOS</Text>
      <View style={styles.list}>
        {steps.map((step) => (
          <View key={step.title} style={styles.card}>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardBody}>{step.body}</Text>
          </View>
        ))}
      </View>
      <Button label="Continue" onPress={() => router.push("/(onboarding)/ready")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { ...typography.title, color: colors.ink, marginTop: spacing.md, marginBottom: spacing.lg },
  list: { flex: 1, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTitle: { ...typography.body, fontWeight: "700", color: colors.ink, marginBottom: 4 },
  cardBody: { ...typography.body, color: colors.muted },
});
