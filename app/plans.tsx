import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, CompanionFace, Screen } from "../src/components/ui";
import { markPlansOffered } from "../src/plansGate";
import { useTheme } from "../src/theme/ThemeContext";
import { spacing } from "../src/theme/tokens";

export default function PlansOfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, type } = useTheme();

  const continueOn = () => {
    markPlansOffered();
    router.replace("/garden");
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
      >
        <View style={{ alignItems: "flex-start", gap: 10 }}>
          <CompanionFace size={48} />
          <Text style={[type.display, { color: colors.ink, fontSize: 30, marginTop: 4 }]}>
            Start with free access
          </Text>
          <Text style={[type.body, { color: colors.muted, lineHeight: 22 }]}>
            Your account starts with 50 AI credits. Earn more by completing tasks, or bring your
            own Gemini key. Paid plans are not available yet.
          </Text>
        </View>

        <Button label="Continue with free access" onPress={continueOn} />
      </ScrollView>
    </Screen>
  );
}
