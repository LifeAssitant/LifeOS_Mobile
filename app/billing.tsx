import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Screen } from "../src/components/ui";
import { useTheme } from "../src/theme/ThemeContext";
import { clayRaised, spacing } from "../src/theme/tokens";

type TierId = "free" | "plus" | "pro";

type Tier = {
  id: TierId;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  cta: string;
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    summary: "A gentle start — one chat, a few planned tasks each month.",
    features: [
      "One chat with your companion",
      "5 AI task creations per month",
      "Garden that grows with finished work",
      "Local reminders on this device",
    ],
    cta: "Current plan",
  },
  {
    id: "plus",
    name: "Plus",
    price: "$15",
    cadence: "per month",
    summary: "Room to talk through the week and keep the plan moving.",
    features: [
      "Open chats whenever you need them",
      "100 AI task creations per month",
      "Google Calendar sync",
      "Voice replies after you speak",
    ],
    cta: "Choose Plus",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$30",
    cadence: "per month",
    summary: "Full LifeOS for days that fill up fast.",
    features: [
      "Unlimited AI task creations",
      "Everything in Plus",
      "Faster companion replies",
      "First look at new garden extras",
    ],
    cta: "Choose Pro",
  },
];

export default function BillingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, type, radii } = useTheme();
  const current: TierId = "free";
  const [note, setNote] = useState("");

  const pick = (tier: Tier) => {
    if (tier.id === current) return;
    setNote(`${tier.name} checkout is not wired up yet — backend next.`);
  };

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

        <View>
          <Text style={[type.display, { color: colors.ink, fontSize: 30 }]}>Plans</Text>
          <Text style={[type.body, { color: colors.muted, marginTop: 6, lineHeight: 22 }]}>
            Start free with one chat and five AI task creations a month. Step up when you want more room.
          </Text>
        </View>

        {TIERS.map((tier) => {
          const active = tier.id === current;
          return (
            <View
              key={tier.id}
              style={[
                clayRaised(colors, { radius: radii.lg, lift: tier.id === "plus" ? 14 : 10 }),
                {
                  padding: spacing.md,
                  gap: 10,
                  borderWidth: active || tier.id === "plus" ? 1.5 : 0,
                  borderColor: active ? colors.accent : tier.id === "plus" ? colors.mint : "transparent",
                },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[type.heading, { color: colors.ink }]}>{tier.name}</Text>
                  {active ? (
                    <Text style={[type.caption, { color: colors.accent }]}>Your plan</Text>
                  ) : null}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[type.title, { color: colors.ink }]}>{tier.price}</Text>
                  <Text style={[type.caption, { color: colors.muted }]}>{tier.cadence}</Text>
                </View>
              </View>

              <Text style={[type.body, { color: colors.inkSoft, lineHeight: 21 }]}>{tier.summary}</Text>

              <View style={{ gap: 6, marginTop: 2 }}>
                {tier.features.map((feature) => (
                  <Text key={feature} style={[type.caption, { color: colors.ink, lineHeight: 18 }]}>
                    · {feature}
                  </Text>
                ))}
              </View>

              <Button
                label={tier.cta}
                variant={active ? "ghost" : tier.id === "plus" ? "primary" : "ghost"}
                disabled={active}
                onPress={() => pick(tier)}
              />
            </View>
          );
        })}

        {note ? (
          <Text style={[type.caption, { color: colors.muted, lineHeight: 18 }]}>{note}</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
