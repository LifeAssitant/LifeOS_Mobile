import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Button, CompanionFace, Screen, ThemeToggle } from "../../src/components/ui";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayRaised, spacing } from "../../src/theme/tokens";

const steps = [
  {
    title: "Talk it out",
    body: "Tell LifeOS what you need in plain words. It writes the tasks and books the events.",
    tone: "mint" as const,
  },
  {
    title: "See your plan",
    body: "A month view and a day list, a tap away from the conversation.",
    tone: "peach" as const,
  },
  {
    title: "Get nudged",
    body: "Notifications arrive before something starts or slips.",
    tone: "sky" as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, radii, type, theme } = useTheme();

  const toneColor = (tone: "mint" | "peach" | "sky") =>
    tone === "mint" ? colors.mint : tone === "peach" ? colors.peach : colors.sky;
  const toneFill = (tone: "mint" | "peach" | "sky") =>
    theme === "playful"
      ? tone === "mint"
        ? colors.mintSoft
        : tone === "peach"
          ? colors.peachSoft
          : colors.skySoft
      : colors.surface2;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <CompanionFace size={48} />
        <Text style={[type.display, { color: colors.ink, marginTop: spacing.md }]}>
          Welcome to LifeOS
        </Text>
        <Text style={[type.body, { color: colors.muted, marginTop: 6, marginBottom: spacing.lg, lineHeight: 22 }]}>
          One conversation keeps your tasks, calendar and reminders in the same place.
        </Text>

        <View style={{ gap: 10, marginBottom: spacing.lg }}>
          {steps.map((step) => (
            <View
              key={step.title}
              style={[
                clayRaised(colors, { radius: radii.lg, lift: 7, background: toneFill(step.tone) }),
                { flexDirection: "row", gap: 12, padding: 14 },
              ]}
            >
              <View
                style={[
                  clayRaised(colors, { radius: radii.sm, lift: 4 }),
                  { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
                ]}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: toneColor(step.tone),
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: colors.ink }]}>{step.title}</Text>
                <Text style={[type.caption, { color: colors.muted, marginTop: 3, lineHeight: 18 }]}>
                  {step.body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[type.caption, { color: colors.muted, marginBottom: 8 }]}>
          Pick a look — you can change it any time
        </Text>
        <View style={{ marginBottom: spacing.lg }}>
          <ThemeToggle />
        </View>

        <Button label="Continue" onPress={() => router.push("/(onboarding)/ready")} />
      </ScrollView>
    </Screen>
  );
}
