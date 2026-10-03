import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Garden } from "../src/components/Garden";
import { Screen } from "../src/components/ui";
import { enterChat } from "../src/gardenGate";
import { useTheme } from "../src/theme/ThemeContext";
import { clayAccent, spacing } from "../src/theme/tokens";

export default function GardenEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, type, radii } = useTheme();
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(slide, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(slide, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [slide]);

  const openChat = () => {
    enterChat();
    router.replace("/(tabs)/home");
  };

  return (
    <Screen style={{ paddingBottom: Math.max(insets.bottom, spacing.md) }}>
      <View style={{ flex: 1 }}>
        <Garden fill />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open chat"
        onPress={openChat}
        style={({ pressed }) => [
          clayAccent(colors, { radius: radii.pill, lift: 6 }),
          {
            marginTop: spacing.md,
            alignSelf: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 12,
            paddingLeft: 18,
            paddingRight: 14,
          },
          pressed ? { opacity: 0.92 } : null,
        ]}
      >
        <Text style={[type.label, { color: colors.accentInk, fontSize: 15 }]}>Open chat</Text>
        <Animated.Text
          style={{
            color: colors.accentInk,
            fontSize: 20,
            transform: [
              {
                translateX: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
              },
            ],
          }}
        >
          →
        </Animated.Text>
      </Pressable>
    </Screen>
  );
}
