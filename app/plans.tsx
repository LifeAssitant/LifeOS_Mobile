import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, CompanionFace, Screen } from "../src/components/ui";
import { markPlansOffered } from "../src/plansGate";
import { useTheme } from "../src/theme/ThemeContext";
import { clayRaised, spacing } from "../src/theme/tokens";

type PaidTierId = "plus" | "pro";

type PaidTier = {
  id: PaidTierId;
  name: string;
  price: string;
  summary: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const PAID_TIERS: PaidTier[] = [
  {
    id: "plus",
    name: "Plus",
    price: "$15",
    summary: "Room to talk through the week and keep the plan moving.",
    features: [
      "Open chats whenever you need them",
      "100 AI task creations per month",
      "Google Calendar sync",
      "Voice replies after you speak",
    ],
    cta: "Start with Plus",
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$30",
    summary: "Full LifeOS for days that fill up fast.",
    features: [
      "Unlimited AI task creations",
      "Everything in Plus",
      "Faster companion replies",
      "First look at new garden extras",
    ],
    cta: "Go Pro",
  },
];

export default function PlansOfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, type, radii } = useTheme();
  const [note, setNote] = useState("");

  const continueOn = () => {
    markPlansOffered();
    router.replace("/garden");
  };

  const pick = (tier: PaidTier) => {
    setNote(`${tier.name} checkout is not wired up yet — continuing on Free.`);
    setTimeout(continueOn, 700);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
      >
        <View style={{ alignItems: "flex-start", gap: 8 }}>
          <CompanionFace size={48} />
          <Text style={[type.display, { color: colors.ink, fontSize: 30, marginTop: 4 }]}>
            Pick a plan that fits
          </Text>
          <Text style={[type.body, { color: colors.muted, lineHeight: 22 }]}>
            Free gives you one chat and five AI task creations a month. Choose Plus or Pro if you want
            more room — or skip and stay on Free.
          </Text>
        </View>

        {PAID_TIERS.map((tier) => (
          <View
            key={tier.id}
            style={[
              clayRaised(colors, { radius: radii.lg, lift: tier.featured ? 14 : 10 }),
              {
                padding: spacing.md,
                gap: 10,
                borderWidth: tier.featured ? 1.5 : 0,
                borderColor: tier.featured ? colors.accent : "transparent",
              },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[type.heading, { color: colors.ink }]}>{tier.name}</Text>
                {tier.featured ? (
                  <Text style={[type.caption, { color: colors.accent }]}>Suggested</Text>
                ) : null}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[type.title, { color: colors.ink }]}>{tier.price}</Text>
                <Text style={[type.caption, { color: colors.muted }]}>per month</Text>
              </View>
            </View>

            <Text style={[type.body, { color: colors.inkSoft, lineHeight: 21 }]}>{tier.summary}</Text>

            <View style={{ gap: 6 }}>
              {tier.features.map((feature) => (
                <Text key={feature} style={[type.caption, { color: colors.ink, lineHeight: 18 }]}>
                  · {feature}
                </Text>
              ))}
            </View>

            <Button
              label={tier.cta}
              variant={tier.featured ? "primary" : "ghost"}
              onPress={() => pick(tier)}
            />
          </View>
        ))}

        {note ? (
          <Text style={[type.caption, { color: colors.muted, lineHeight: 18 }]}>{note}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip for now and continue on Free"
          onPress={continueOn}
          style={{ alignItems: "center", paddingVertical: 12 }}
        >
          <Text style={[type.label, { color: colors.inkSoft, fontSize: 14 }]}>
            Skip for now — continue on Free
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
