import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../src/components/ui";
import { useTheme } from "../src/theme/ThemeContext";
import { clayRaised, spacing } from "../src/theme/tokens";

export default function BillingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, type, radii } = useTheme();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[
            clayRaised(colors, { radius: radii.pill }),
            { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 14 },
          ]}
        >
          <Text style={[type.label, { color: colors.ink, fontSize: 13 }]}>← Back</Text>
        </Pressable>

        <View style={{ gap: spacing.sm }}>
          <Text style={[type.display, { color: colors.ink, fontSize: 30 }]}>Free access</Text>
          <Text style={[type.body, { color: colors.muted, lineHeight: 22 }]}>
            Your account starts with 50 AI credits. Earn another credit for every 50 tasks you
            complete, or bring your own Gemini key.
          </Text>
        </View>

        <View
          style={[
            clayRaised(colors, { radius: radii.lg, lift: 10 }),
            { padding: spacing.md, gap: 10 },
          ]}
        >
          <Text style={[type.heading, { color: colors.ink }]}>Included</Text>
          <Text style={[type.body, { color: colors.inkSoft }]}>
            Tasks, events, reminders, and planning
          </Text>
          <Text style={[type.body, { color: colors.inkSoft }]}>50 starter AI credits</Text>
          <Text style={[type.body, { color: colors.inkSoft }]}>Credits earned by completed tasks</Text>
          <Text style={[type.body, { color: colors.inkSoft }]}>
            Optional Gemini key for provider-billed AI use
          </Text>
        </View>

        <Text style={[type.caption, { color: colors.muted, lineHeight: 18 }]}>
          Paid credit packs and subscriptions are not available. You will not be charged.
        </Text>
      </ScrollView>
    </Screen>
  );
}
