import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import { api } from "../../src/api/client";
import { Button, Field, Panel, Screen, ThemeToggle } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, typography } from "../../src/theme/tokens";

export default function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [mode, setMode] = useState<"hosted" | "byok">(user?.ai_mode ?? "hosted");
  const [key, setKey] = useState("");
  const [remindBefore, setRemindBefore] = useState(String(user?.remind_before_minutes ?? 15));
  const [saving, setSaving] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(
    Boolean(user?.google_calendar_connected)
  );
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setCalendarConnected(Boolean(user?.google_calendar_connected));
  }, [user?.google_calendar_connected]);

  useFocusEffect(
    useCallback(() => {
      void api.googleCalendarStatus()
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ ...typography.title, color: colors.ink, marginBottom: 4 }}>Settings</Text>
        <Text style={{ ...typography.caption, color: colors.muted, marginBottom: spacing.lg }}>
          Appearance, calendar, and AI.
        </Text>

        <Text style={{ ...typography.caption, color: colors.muted, marginBottom: 8, textTransform: "uppercase" }}>
          Appearance
        </Text>
        <View style={{ marginBottom: spacing.lg }}>
          <ThemeToggle />
        </View>

        <Panel style={{ marginBottom: spacing.md }}>
          <Text style={{ ...typography.body, fontWeight: "700", color: colors.ink }}>{user?.email}</Text>
          <Text style={{ ...typography.caption, color: colors.muted, marginTop: 4 }}>
            Credits: {user?.credit_balance ?? 0} · BYOK: {user?.has_byok_key ? "saved" : "not set"}
          </Text>
        </Panel>

        <Panel soft="accent" style={{ marginBottom: spacing.md }}>
          <Text style={{ ...typography.title, fontSize: 17, color: colors.ink, marginBottom: 4 }}>
            Google Calendar
          </Text>
          <Text style={{ ...typography.caption, color: colors.muted, marginBottom: 12, lineHeight: 18 }}>
            {calendarConnected
              ? "Your Google events appear quietly on Plan."
              : "Connect once — LifeOS reads your primary calendar (no edits)."}
          </Text>
          {calendarConnected ? (
            <View style={{ gap: 8 }}>
              <Button label="Sync now" variant="ghost" onPress={() => void syncCalendar()} loading={calendarBusy} />
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
            <Text style={{ ...typography.caption, color: colors.muted, marginTop: 10 }}>{msg}</Text>
          ) : null}
        </Panel>

        <Text style={{ ...typography.body, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm }}>
          AI mode
        </Text>
        <View style={{ gap: 8, marginBottom: spacing.md }}>
          <Button
            label="LifeOS API"
            variant={mode === "hosted" ? "primary" : "ghost"}
            onPress={() => setMode("hosted")}
          />
          <Button
            label="My Gemini key"
            variant={mode === "byok" ? "primary" : "ghost"}
            onPress={() => setMode("byok")}
          />
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
          <View style={{ marginBottom: spacing.md }}>
            <Button label="Buy credits" variant="ghost" onPress={() => void buyCredits()} />
          </View>
        )}

        <Field
          label="Remind me minutes before"
          value={remindBefore}
          onChangeText={setRemindBefore}
          keyboardType="number-pad"
        />

        <View style={{ marginBottom: spacing.md }}>
          <Button
            label={user?.quiet_hours_enabled ? "Quiet hours: on" : "Quiet hours: off"}
            variant="ghost"
            onPress={async () => {
              await api.updateMe({ quiet_hours_enabled: !user?.quiet_hours_enabled });
              await refreshUser();
            }}
          />
        </View>

        <Button label="Save" onPress={() => void saveAi()} loading={saving} />
        <View style={{ height: spacing.md }} />
        <Button label="Sign out" variant="danger" onPress={() => void logout()} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
