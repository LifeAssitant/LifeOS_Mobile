import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api, ChatMessage } from "../../src/api/client";
import { Chip, EmptyState, Panel, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayShadow, radii, spacing, typography } from "../../src/theme/tokens";

export default function HomeScreen() {
  const { offlineHint, setOfflineHint } = useAuth();
  const { colors, style: themeStyle } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const history = await api.chatHistory();
      setMessages(history);
      setOfflineHint(null);
    } catch {
      setOfflineHint("We’ll sync when you’re back.");
    }
  }, [setOfflineHint]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft("");
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const reply = await api.chatSend(text);
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), optimistic, reply]);
      await load();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      Alert.alert("Chat error", err instanceof Error ? err.message : "Try again");
    } finally {
      setSending(false);
    }
  };

  const undo = async (messageId: string, index: number) => {
    try {
      await api.chatUndo(messageId, index);
      await load();
    } catch (err) {
      Alert.alert("Undo failed", err instanceof Error ? err.message : "Try again");
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
          <Text style={{ ...typography.brand, fontSize: 28, color: colors.ink }}>LifeOS</Text>
          <Text style={{ ...typography.caption, color: colors.muted, marginTop: 4 }}>
            Talk · plan · rearrange your day
          </Text>
          {offlineHint ? (
            <Text style={{ ...typography.caption, color: colors.warm, marginTop: 8 }}>{offlineHint}</Text>
          ) : null}
        </View>

        <Panel soft="warm" style={{ flex: 1, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: 0, overflow: "hidden" }}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: 12, flexGrow: 1 }}
            ListEmptyComponent={
              <EmptyState
                title="Say anything"
                body="Ask LifeOS to schedule something — open Plan to review your month."
              />
            }
            renderItem={({ item }) => (
              <View
                style={{
                  maxWidth: "88%",
                  padding: spacing.md,
                  borderRadius: radii.md,
                  marginBottom: spacing.sm,
                  alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: item.role === "user" ? colors.warmSoft : colors.cardStrong,
                  borderBottomRightRadius: item.role === "user" ? 4 : radii.md,
                  borderBottomLeftRadius: item.role === "user" ? radii.md : 4,
                  ...clayShadow(themeStyle, colors),
                }}
              >
                <Text style={{ ...typography.body, color: colors.ink }}>{item.content}</Text>
                {item.actions?.map((action, idx) =>
                  action.undone ? null : (
                    <Chip
                      key={`${item.id}-${idx}`}
                      label={`${action.summary} · Undo`}
                      onPress={() => void undo(item.id, idx)}
                    />
                  )
                )}
              </View>
            )}
          />

          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              padding: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.line,
              backgroundColor: colors.well,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: colors.input,
                borderRadius: radii.pill,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.ink,
              }}
              placeholder="Talk to LifeOS…"
              placeholderTextColor={colors.muted}
              value={draft}
              onChangeText={setDraft}
              editable={!sending}
            />
            <Pressable
              style={{
                backgroundColor: colors.warm,
                borderRadius: radii.pill,
                paddingHorizontal: 16,
                justifyContent: "center",
              }}
              onPress={() => void send()}
              disabled={sending}
            >
              <Text style={{ fontWeight: "700", color: "#fff" }}>{sending ? "…" : "Send"}</Text>
            </Pressable>
          </View>
        </Panel>
      </KeyboardAvoidingView>
    </Screen>
  );
}
