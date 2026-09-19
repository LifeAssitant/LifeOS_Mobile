import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { api, Task } from "../../src/api/client";
import { Button, EmptyState, Field, Screen } from "../../src/components/ui";
import { scheduleLocalReminder } from "../../src/notifications";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayRaised, spacing } from "../../src/theme/tokens";

export default function TasksScreen() {
  const { colors, radii, type } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await api.tasks("open");
    setTasks(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load().catch(() => undefined);
    }, [load])
  );

  const add = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const due = new Date(Date.now() + 60 * 60 * 1000);
      const task = await api.createTask({
        title: title.trim(),
        due_at: due.toISOString(),
      });
      await scheduleLocalReminder(
        task.id,
        "Task reminder",
        task.title,
        new Date(due.getTime() - 15 * 60 * 1000)
      );
      setTitle("");
      await load();
    } catch (err) {
      Alert.alert("Could not add", err instanceof Error ? err.message : "Try again");
    } finally {
      setSaving(false);
    }
  };

  const complete = async (id: string) => {
    await api.completeTask(id);
    await load();
  };

  return (
    <Screen>
      <Text style={[type.title, { color: colors.ink, marginBottom: spacing.md }]}>Tasks</Text>

      <Field
        label="Quick add"
        placeholder="Something small…"
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={() => void add()}
      />
      <Button label="Add task" onPress={() => void add()} loading={saving} />

      <FlatList
        style={{ marginTop: spacing.lg }}
        contentContainerStyle={{ gap: 8, paddingBottom: spacing.xl }}
        data={tasks}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="All clear" body="Enjoy the quiet — or add one above." />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => void complete(item.id)}
            style={({ pressed }) => [
              clayRaised(colors, { radius: radii.md, lift: 6, background: colors.surface2 }),
              { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
              pressed ? { transform: [{ scale: 0.99 }] } : null,
            ]}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: colors.accent,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: colors.ink }]}>{item.title}</Text>
              <Text style={[type.caption, { color: colors.muted, marginTop: 2, fontSize: 11.5 }]}>
                {item.due_at ? new Date(item.due_at).toLocaleString() : "No due time"}
              </Text>
            </View>
            <Text style={[type.caption, { color: colors.inkSoft }]}>Done</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
