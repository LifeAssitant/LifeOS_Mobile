import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, type TextStyle } from "react-native";

import { api } from "../../src/api/client";
import { BusyBasket } from "../../src/components/BusyBasket";
import { Button, CompanionFace, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayAccent, clayInset, clayRaised, spacing } from "../../src/theme/tokens";

const PROFESSIONS = [
  "Student",
  "Software / Engineering",
  "Design",
  "Product / Program",
  "Founder / Self-employed",
  "Teacher / Academic",
  "Healthcare",
  "Finance / Legal",
  "Sales / Marketing",
  "Operations / Admin",
  "Creative / Media",
  "Trades / Field work",
  "Caring for family",
  "Between things",
];

const USE_CASES = [
  "Work and deadlines",
  "Study and exams",
  "Health and fitness",
  "Family and home",
  "Side projects",
  "Habits and routines",
  "Money and bills",
  "Travel plans",
  "Social life",
  "Appointments",
];

const STAGES = 4;

function splitExtra(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AttuneScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { colors, radii, type } = useTheme();
  const [stage, setStage] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);
  const [roleOther, setRoleOther] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(0);
  const [uses, setUses] = useState<string[]>([]);
  const [useOther, setUseOther] = useState("");
  const [saving, setSaving] = useState(false);

  const chosenRoles = useMemo(() => [...roles, ...splitExtra(roleOther)], [roles, roleOther]);
  const chosenUses = useMemo(() => [...uses, ...splitExtra(useOther)], [uses, useOther]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const leave = () => router.push("/(onboarding)/ready");

  const submit = async () => {
    setSaving(true);
    try {
      await api.saveProfile({
        professions: chosenRoles.length ? chosenRoles : undefined,
        age: Number(age) || undefined,
        busy_level: busy || undefined,
        use_cases: chosenUses.length ? chosenUses : undefined,
      });
      await refreshUser();
    } catch {
      /* never block a new user on an analytics answer */
    } finally {
      setSaving(false);
      leave();
    }
  };

  const canAdvance =
    stage === 0
      ? chosenRoles.length > 0
      : stage === 1
        ? Boolean(Number(age))
        : stage === 2
          ? busy > 0
          : true;

  const textField = [
    clayInset(colors, { radius: radii.md }) as TextStyle,
    { padding: 14, color: colors.ink, fontSize: 15 },
  ];

  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={({ pressed }) => [
        on
          ? clayAccent(colors, { radius: 999, lift: 6 })
          : clayRaised(colors, { radius: 999, lift: 5, background: colors.surface2 }),
        { paddingHorizontal: 14, paddingVertical: 9 },
        pressed ? { transform: [{ scale: 0.97 }] } : null,
      ]}
    >
      <Text style={[type.caption, { color: on ? colors.accentInk : colors.inkSoft, fontSize: 13 }]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <CompanionFace size={38} />
          <View style={{ flex: 1 }}>
            <Text style={[type.display, { color: colors.ink, fontSize: 24 }]}>Attune</Text>
            <Text style={[type.caption, { color: colors.muted, marginTop: 2 }]}>
              Four quick things so LifeOS starts out shaped like your life.
            </Text>
          </View>
          <Text style={[type.caption, { color: colors.muted }]}>
            {stage + 1} / {STAGES}
          </Text>
        </View>

        <View
          style={[
            clayInset(colors, { radius: 999 }),
            { height: 7, marginTop: spacing.md, overflow: "hidden" },
          ]}
        >
          <View
            style={{
              height: "100%",
              width: `${((stage + 1) / STAGES) * 100}%`,
              borderRadius: 999,
              backgroundColor: colors.accent,
            }}
          />
        </View>

        {stage === 0 ? (
          <View style={{ marginTop: spacing.lg, gap: 12 }}>
            <Text style={[type.title, { color: colors.ink, fontSize: 19 }]}>
              What do you spend your days doing?
            </Text>
            <Text style={[type.caption, { color: colors.muted, marginTop: -6 }]}>
              Pick everything that fits — most people wear a few hats.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {PROFESSIONS.map((item) =>
                chip(item, roles.includes(item), () => toggle(roles, setRoles, item))
              )}
            </View>
            <TextInput
              value={roleOther}
              onChangeText={setRoleOther}
              placeholder="Something else? Separate with commas"
              placeholderTextColor={colors.muted}
              style={textField}
            />
          </View>
        ) : null}

        {stage === 1 ? (
          <View style={{ marginTop: spacing.lg, gap: 12 }}>
            <Text style={[type.title, { color: colors.ink, fontSize: 19 }]}>How old are you?</Text>
            <Text style={[type.caption, { color: colors.muted, marginTop: -6 }]}>
              It helps us read the rest of your answers.
            </Text>
            <View
              style={[
                clayInset(colors, { radius: radii.lg }),
                {
                  flexDirection: "row",
                  alignItems: "baseline",
                  justifyContent: "center",
                  gap: 10,
                  paddingVertical: spacing.lg,
                },
              ]}
            >
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="24"
                placeholderTextColor={colors.line}
                maxLength={3}
                style={{
                  minWidth: 110,
                  textAlign: "center",
                  color: colors.accent,
                  fontFamily: type.display.fontFamily,
                  fontSize: 52,
                }}
              />
              <Text style={[type.label, { color: colors.muted }]}>years</Text>
            </View>
          </View>
        ) : null}

        {stage === 2 ? (
          <View style={{ marginTop: spacing.lg, gap: 12 }}>
            <Text style={[type.title, { color: colors.ink, fontSize: 19 }]}>
              How packed is a normal week?
            </Text>
            <Text style={[type.caption, { color: colors.muted, marginTop: -6, lineHeight: 18 }]}>
              Drag the pieces into the basket — or just tap them. The fuller it gets, the busier you
              are.
            </Text>
            <BusyBasket value={busy} onChange={setBusy} />
          </View>
        ) : null}

        {stage === 3 ? (
          <View style={{ marginTop: spacing.lg, gap: 12 }}>
            <Text style={[type.title, { color: colors.ink, fontSize: 19 }]}>
              What will you lean on LifeOS for?
            </Text>
            <Text style={[type.caption, { color: colors.muted, marginTop: -6 }]}>
              Pick as many as fit.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {USE_CASES.map((item) => chip(item, uses.includes(item), () => toggle(uses, setUses, item)))}
            </View>
            <TextInput
              value={useOther}
              onChangeText={setUseOther}
              placeholder="Anything else? Separate with commas"
              placeholderTextColor={colors.muted}
              style={textField}
            />
          </View>
        ) : null}

        <View style={{ marginTop: spacing.lg, gap: 10 }}>
          {stage < STAGES - 1 ? (
            <Button label="Next" onPress={() => setStage((s) => s + 1)} disabled={!canAdvance} />
          ) : (
            <Button label="Done — show me around" onPress={() => void submit()} loading={saving} />
          )}
          {stage > 0 ? (
            <Button label="Back" variant="ghost" onPress={() => setStage((s) => s - 1)} />
          ) : null}
          <Pressable onPress={leave} hitSlop={8} style={{ alignSelf: "center", padding: 8 }}>
            <Text style={[type.label, { color: colors.muted, fontSize: 13 }]}>
              I'll do this later
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
