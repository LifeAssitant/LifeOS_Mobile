import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../src/components/ui";
import { useTheme } from "../src/theme/ThemeContext";
import { clayAccent, clayRaised, spacing } from "../src/theme/tokens";

export default function GardenStorePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, type, radii } = useTheme();

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to garden"
          onPress={() => router.back()}
          style={[clayRaised(colors, { radius: radii.pill }), { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 14 }]}
        >
          <Text style={[type.label, { color: colors.ink, fontSize: 13 }]}>← Back</Text>
        </Pressable>

        <View style={{ alignItems: "flex-start", gap: 10, paddingBottom: 48 }}>
          <Text style={[type.caption, { color: colors.inkSoft, letterSpacing: 0.6 }]}>GARDEN STORE</Text>
          <Text style={[type.display, { color: colors.ink, fontSize: 36 }]}>Coming soon</Text>
          <Text style={[type.body, { color: colors.inkSoft, lineHeight: 22, maxWidth: 300 }]}>
            Seeds, benches, and little yard extras will land here later.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[
              clayAccent(colors, { radius: radii.pill, lift: 4 }),
              { marginTop: 8, paddingVertical: 10, paddingHorizontal: 16 },
            ]}
          >
            <Text style={[type.label, { color: colors.accentInk }]}>Back to garden</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
