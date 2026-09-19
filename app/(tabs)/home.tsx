import { useCallback, useMemo, useRef, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";

import { api, ChatMessage } from "../../src/api/client";
import { Markdown } from "../../src/components/Markdown";
import { useTourTarget } from "../../src/components/Tour";
import { AccountButton, Chip, CompanionFace, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayAccent, clayInset, clayRaised, spacing } from "../../src/theme/tokens";

function greeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const SUGGESTIONS: Array<{
  tone: "mint" | "peach" | "sky" | "lilac";
  title: string;
  hint: string;
  prompt: string;
}> = [
  {
    tone: "mint",
    title: "Shape my day",
    hint: "Block time around what is already fixed",
    prompt: "Plan the rest of my day around what I already have scheduled.",
  },
  {
    tone: "peach",
    title: "Add something",
    hint: "A task or event in one sentence",
    prompt: "Groceries after work tomorrow, remind me at 6pm.",
  },
  {
    tone: "sky",
    title: "What is next",
    hint: "The next few things coming up",
    prompt: "What's coming up for me today?",
  },
  {
    tone: "lilac",
    title: "Make room",
    hint: "Move or drop what can wait",
    prompt: "Clear my evening — move anything that can wait to tomorrow.",
  },
];

export default function HomeScreen() {
  const { offlineHint, setOfflineHint, user, logout } = useAuth();
  const { colors, radii, type, theme } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const composerTarget = useTourTarget("composer");
  const suggestionsTarget = useTourTarget("suggestions");
  const accountTarget = useTourTarget("account");

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

  const firstName = useMemo(
    () => (user?.display_name || user?.email || "").split(/[\s@]/)[0],
    [user?.display_name, user?.email]
  );
  const today = new Date();

  const toneColor = (tone: "mint" | "peach" | "sky" | "lilac") =>
    tone === "mint"
      ? colors.mint
      : tone === "peach"
        ? colors.peach
        : tone === "sky"
          ? colors.sky
          : colors.lilac;

  const toneFill = (tone: "mint" | "peach" | "sky" | "lilac") =>
    theme === "playful"
      ? tone === "mint"
        ? colors.mintSoft
        : tone === "peach"
          ? colors.peachSoft
          : tone === "sky"
            ? colors.skySoft
            : colors.lilacSoft
      : colors.surface2;

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
          }}
        >
          <CompanionFace size={38} />
          <View style={{ flex: 1 }}>
            <Text style={[type.title, { color: colors.ink, fontSize: 20 }]}>
              {firstName ? `${greeting(today)}, ${firstName}` : greeting(today)}
            </Text>
            <Text style={[type.caption, { color: colors.muted, marginTop: 1 }]}>
              {offlineHint ??
                today.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
            </Text>
          </View>
          <View {...accountTarget}>
            <AccountButton
              name={user?.display_name}
              email={user?.email}
              onSettings={() => router.push("/(tabs)/settings")}
              onLogout={() => void logout()}
            />
          </View>
        </View>

        <View
          style={[
            clayRaised(colors, { radius: radii.xl, lift: 12 }),
            {
              flex: 1,
              marginHorizontal: spacing.sm,
              marginBottom: spacing.sm,
              padding: spacing.sm,
              overflow: "hidden",
            },
          ]}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.sm, gap: 10, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 4 }}>
                <Text style={[type.display, { color: colors.ink, fontSize: 26 }]}>
                  What should today look like?
                </Text>
                <Text
                  style={[
                    type.body,
                    { color: colors.muted, marginTop: 6, marginBottom: 18, lineHeight: 21 },
                  ]}
                >
                  Describe it the way you would to a friend. LifeOS writes the tasks, books the time
                  and sets the reminders.
                </Text>
                <View style={{ gap: 10 }} {...suggestionsTarget}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s.title}
                      onPress={() => {
                        setDraft(s.prompt);
                        inputRef.current?.focus();
                      }}
                      style={({ pressed }) => [
                        clayRaised(colors, {
                          radius: radii.lg,
                          lift: 7,
                          background: toneFill(s.tone),
                        }),
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          padding: 13,
                        },
                        pressed ? { transform: [{ scale: 0.99 }] } : null,
                      ]}
                    >
                      <View
                        style={[
                          clayRaised(colors, { radius: radii.sm, lift: 4 }),
                          { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
                        ]}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: toneColor(s.tone),
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[type.label, { color: colors.ink }]}>{s.title}</Text>
                        <Text
                          style={[type.caption, { color: colors.muted, marginTop: 2, fontSize: 11.5 }]}
                        >
                          {s.hint}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              return (
                <View
                  style={[
                    clayRaised(colors, {
                      radius: radii.lg,
                      lift: 6,
                      background: isUser ? colors.accentSoft : colors.surface2,
                    }),
                    {
                      maxWidth: "92%",
                      padding: 13,
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      borderBottomRightRadius: isUser ? 8 : radii.lg,
                      borderBottomLeftRadius: isUser ? radii.lg : 8,
                    },
                  ]}
                >
                  {isUser ? (
                    <Text style={[type.body, { color: colors.ink, lineHeight: 21 }]}>
                      {item.content}
                    </Text>
                  ) : (
                    <Markdown text={item.content} />
                  )}
                  {item.actions?.some((a) => !a.undone) ? (
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}
                    >
                      {item.actions.map((action, idx) =>
                        action.undone ? null : (
                          <Chip
                            key={`${item.id}-${idx}`}
                            label={`${action.summary} · Undo`}
                            onPress={() => void undo(item.id, idx)}
                          />
                        )
                      )}
                    </View>
                  ) : null}
                </View>
              );
            }}
          />

          <View
            {...composerTarget}
            style={[
              clayInset(colors, { radius: 999 }),
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingLeft: 18,
                paddingRight: 7,
                paddingVertical: 7,
                margin: spacing.sm,
                marginTop: 0,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={{ flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 6 }}
              placeholder="Talk to LifeOS…"
              placeholderTextColor={colors.muted}
              value={draft}
              onChangeText={setDraft}
              editable={!sending}
              onSubmitEditing={() => void send()}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => void send()}
              disabled={sending || !draft.trim()}
              accessibilityLabel="Send message"
              style={({ pressed }) => [
                clayAccent(colors, { radius: 999, lift: 6 }),
                {
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: sending || !draft.trim() ? 0.45 : 1,
                },
                pressed ? { transform: [{ scale: 0.95 }] } : null,
              ]}
            >
              <Text style={{ color: colors.accentInk, fontSize: 17, fontWeight: "700" }}>→</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
