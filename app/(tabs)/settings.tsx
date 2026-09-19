import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { api } from "../../src/api/client";
import { useTour } from "../../src/components/Tour";
import { Button, Field, Panel, Screen, ThemeToggle } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayInset, clayRaised, spacing } from "../../src/theme/tokens";
import { getSpeakReplies, setSpeakReplies, stopSpeaking } from "../../src/voice";

export default function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { colors, radii, type } = useTheme();
  const router = useRouter();
  const { start: startTour } = useTour();
  const [mode, setMode] = useState<"hosted" | "byok">(user?.ai_mode ?? "hosted");
  const [key, setKey] = useState("");
  const [remindBefore, setRemindBefore] = useState(String(user?.remind_before_minutes ?? 15));
  const [saving, setSaving] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(
    Boolean(user?.google_calendar_connected)
  );
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [speakReplies, setSpeakRepliesOn] = useState(true);

  useEffect(() => {
    void getSpeakReplies().then(setSpeakRepliesOn);
  }, []);

  useEffect(() => {
    setCalendarConnected(Boolean(user?.google_calendar_connected));
  }, [user?.google_calendar_connected]);

  useFocusEffect(
    useCallback(() => {
      void api
        .googleCalendarStatus()
        .then((s) => setCalendarConnected(s.connected))
        .catch(() => null);
    }, [])
  );

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (!url.includes("calendar-connected")) return;
      void (async () => {
        setMsg("Google Calendar connected. Syncing…");
        try {
          await api.googleCalendarSync();
          await refreshUser();
          setCalendarConnected(true);
          setMsg("Google Calendar synced.");
        } catch (err) {
          setMsg(err instanceof Error ? err.message : "Sync failed");
        }
      })();
    });
    return () => sub.remove();
  }, [refreshUser]);

  const saveAi = async () => {
    setSaving(true);
    try {
      await api.updateAi({
        ai_mode: mode,
        gemini_api_key: mode === "byok" ? key || undefined : undefined,
      });
      await api.updateMe({ remind_before_minutes: Number(remindBefore) || 15 });
      await refreshUser();
      Alert.alert("Saved", "Your preferences are updated.");
      setKey("");
    } catch (err) {
      Alert.alert("Could not save", err instanceof Error ? err.message : "Try again");
    } finally {
      setSaving(false);
    }
  };

  const buyCredits = async () => {
    try {
      const { checkout_url } = await api.checkout();
      await Linking.openURL(checkout_url);
    } catch (err) {
      Alert.alert("Billing", err instanceof Error ? err.message : "Stripe not configured yet");
    }
  };

  const connectCalendar = async () => {
    setCalendarBusy(true);
    setMsg("");
    try {
      const { url } = await api.googleCalendarConnect();
      await Linking.openURL(url);
      setMsg("Finish connecting in your browser…");
    } catch (err) {
      Alert.alert("Calendar", err instanceof Error ? err.message : "Could not connect");
    } finally {
      setCalendarBusy(false);
    }
  };

  const syncCalendar = async () => {
    setCalendarBusy(true);
    try {
      const result = await api.googleCalendarSync();
      setMsg(`Synced ${result.synced} events.`);
    } catch (err) {
      Alert.alert("Sync failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setCalendarBusy(false);
    }
  };

  const disconnectCalendar = async () => {
    setCalendarBusy(true);
    try {
      await api.googleCalendarDisconnect();
      await refreshUser();
      setCalendarConnected(false);
      setMsg("Google Calendar disconnected.");
    } catch (err) {
      Alert.alert("Disconnect failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setCalendarBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
        <View>
          <Text style={[type.title, { color: colors.ink }]}>Settings</Text>
          <Text style={[type.caption, { color: colors.muted, marginTop: 2 }]}>
            Theme, calendar, reminders and AI
          </Text>
        </View>

        <Panel>
          <Text style={[type.heading, { color: colors.ink, marginBottom: 10 }]}>Theme</Text>
          <ThemeToggle />
        </Panel>

        <Panel>
          <Text style={[type.heading, { color: colors.ink }]}>{user?.email}</Text>
          <Text style={[type.caption, { color: colors.muted, marginTop: 4 }]}>
            {user?.credit_balance ?? 0} credits · Gemini key{" "}
            {user?.has_byok_key ? "saved" : "not set"}
          </Text>
        </Panel>

        <Panel>
          <Text style={[type.heading, { color: colors.ink, marginBottom: 4 }]}>Google Calendar</Text>
          <Text style={[type.caption, { color: colors.muted, marginBottom: 12, lineHeight: 18 }]}>
            {calendarConnected
              ? "Your Google events show up on Plan. LifeOS never edits them."
              : "Connect once — LifeOS reads your primary calendar and makes no changes."}
          </Text>
          {calendarConnected ? (
            <View style={{ gap: 8 }}>
              <Button
                label="Sync now"
                variant="ghost"
                onPress={() => void syncCalendar()}
                loading={calendarBusy}
              />
              <Button
                label="Disconnect"
                variant="ghost"
                onPress={() => void disconnectCalendar()}
                loading={calendarBusy}
              />
            </View>
          ) : (
            <Button
              label={calendarBusy ? "Opening…" : "Connect Google Calendar"}
              onPress={() => void connectCalendar()}
              loading={calendarBusy}
            />
          )}
          {msg ? (
            <Text style={[type.caption, { color: colors.muted, marginTop: 10 }]}>{msg}</Text>
          ) : null}
        </Panel>

        <Panel>
          <Text style={[type.heading, { color: colors.ink, marginBottom: 4 }]}>Voice</Text>
          <Text style={[type.caption, { color: colors.muted, marginBottom: 12, lineHeight: 18 }]}>
            Tap the mic to talk. After you do, LifeOS can read its reply out loud.
          </Text>
          <View
            style={[
              clayInset(colors, { radius: radii.md }),
              { flexDirection: "row", gap: 4, padding: 4 },
            ]}
          >
            {(
              [
                { key: true, label: "Speak replies" },
                { key: false, label: "Text only" },
              ] as const
            ).map((option) => {
              const active = speakReplies === option.key;
              return (
                <Pressable
                  key={option.label}
                  onPress={() => {
                    setSpeakRepliesOn(option.key);
                    void setSpeakReplies(option.key);
                    if (!option.key) stopSpeaking();
                  }}
                  style={[
                    active
                      ? clayRaised(colors, { radius: radii.sm, lift: 4 })
                      : { borderRadius: radii.sm },
                    { flex: 1, paddingVertical: 9, alignItems: "center" },
                  ]}
                >
                  <Text style={[type.caption, { color: active ? colors.ink : colors.muted }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Panel>

        <Panel>
          <Text style={[type.heading, { color: colors.ink, marginBottom: 4 }]}>AI</Text>
          <Text style={[type.caption, { color: colors.muted, marginBottom: 12, lineHeight: 18 }]}>
            Use LifeOS credits, or bring your own Gemini key and skip them entirely.
          </Text>

          <View
            style={[
              clayInset(colors, { radius: radii.md }),
              { flexDirection: "row", gap: 4, padding: 4, marginBottom: 12 },
            ]}
          >
            {(
              [
                { key: "hosted", label: "LifeOS credits" },
                { key: "byok", label: "My Gemini key" },
              ] as const
            ).map((option) => {
              const active = mode === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setMode(option.key)}
                  style={[
                    active
                      ? clayRaised(colors, { radius: radii.sm, lift: 4 })
                      : { borderRadius: radii.sm },
                    { flex: 1, paddingVertical: 9, alignItems: "center" },
                  ]}
                >
                  <Text
                    style={[type.caption, { color: active ? colors.ink : colors.muted }]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === "byok" ? (
            <Field
              label="Gemini API key"
              value={key}
              onChangeText={setKey}
              autoCapitalize="none"
              placeholder={user?.has_byok_key ? "•••••••• (leave blank to keep)" : "AIza…"}
            />
          ) : (
            <Button label="Buy credits" variant="ghost" onPress={() => void buyCredits()} />
          )}
        </Panel>

        <Panel>
          <Text style={[type.heading, { color: colors.ink, marginBottom: 4 }]}>Reminders</Text>
          <Text style={[type.caption, { color: colors.muted, marginBottom: 12, lineHeight: 18 }]}>
            How early should a nudge arrive before something starts?
          </Text>
          <Field
            label="Remind me before (minutes)"
            value={remindBefore}
            onChangeText={setRemindBefore}
            keyboardType="number-pad"
          />
          <Button
            label={user?.quiet_hours_enabled ? "Quiet hours: on" : "Quiet hours: off"}
            variant="ghost"
            onPress={async () => {
              await api.updateMe({ quiet_hours_enabled: !user?.quiet_hours_enabled });
              await refreshUser();
            }}
          />
        </Panel>

        <Panel>
          <Text style={[type.heading, { color: colors.ink, marginBottom: 4 }]}>Walkthrough</Text>
          <Text style={[type.caption, { color: colors.muted, marginBottom: 12, lineHeight: 18 }]}>
            Replay the short tour of the app.
          </Text>
          <Button
            label="Show me around again"
            variant="ghost"
            onPress={() => {
              router.push("/(tabs)/home");
              startTour();
            }}
          />
        </Panel>

        <Button label="Save changes" onPress={() => void saveAi()} loading={saving} />
        <Button label="Sign out" variant="danger" onPress={() => void logout()} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
