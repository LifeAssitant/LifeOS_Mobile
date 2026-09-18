import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api, ChatMessage, EventItem, Task } from "../../src/api/client";
import { Chip, CompanionFace, EmptyState, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { colors, radii, spacing, typography } from "../../src/theme/tokens";

export default function HomeScreen() {
  const { offlineHint, setOfflineHint } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [today, history] = await Promise.all([api.today(), api.chatHistory()]);
      setTasks(today.tasks);
      setEvents(today.events);
      setMessages(history);
      setOfflineHint(null);
    } catch {
      setOfflineHint("We’ll sync when you’re back.");
    }
  }, [setOfflineHint]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft("");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      },
    ]);
    try {
      const reply = await api.chatSend(text);
      setMessages((prev) => [...prev, reply]);
      await load();
    } catch (err) {
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
        <View style={styles.header}>
          <CompanionFace size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.muted}>
              {tasks.length} open · {events.length} events
            </Text>
          </View>
        </View>
        {offlineHint ? <Text style={styles.offline}>{offlineHint}</Text> : null}

        <View style={styles.todayStrip}>
          {tasks.slice(0, 3).map((t) => (
            <Text key={t.id} style={styles.todayItem}>
              · {t.title}
            </Text>
          ))}
          {!tasks.length && !events.length ? (
            <Text style={styles.muted}>Nothing scheduled — say hi below.</Text>
          ) : null}
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 12, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState title="Say anything" body="“Remind me to call mom at 6” works great." />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.bubbleText}>{item.content}</Text>
              {item.actions?.map((action, idx) =>
                action.undone ? null : (
                  <Chip
                    key={`${item.id}-${idx}`}
                    label={`${action.summary} · Undo`}
                    onPress={() => undo(item.id, idx)}
                  />
                )
              )}
            </View>
          )}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Talk to LifeOS…"
            placeholderTextColor={colors.muted}
            value={draft}
            onChangeText={setDraft}
            editable={!sending}
          />
          <Pressable style={styles.send} onPress={send} disabled={sending}>
            <Text style={styles.sendText}>{sending ? "…" : "Send"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.title, color: colors.ink },
  muted: { ...typography.caption, color: colors.muted },
  offline: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.peach,
    ...typography.caption,
  },
  todayStrip: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.mintSoft,
    borderRadius: radii.md,
  },
  todayItem: { ...typography.body, color: colors.ink },
  bubble: {
    maxWidth: "88%",
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.peachSoft,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  bubbleText: { ...typography.body, color: colors.ink },
  composer: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgSoft,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.ink,
  },
  send: {
    backgroundColor: colors.peach,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: { fontWeight: "700", color: colors.ink },
});
