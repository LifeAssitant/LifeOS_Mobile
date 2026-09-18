import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { api, Task } from "../../src/api/client";
import { Button, EmptyState, Field, Screen } from "../../src/components/ui";
import { scheduleLocalReminder } from "../../src/notifications";
import { useTheme } from "../../src/theme/ThemeContext";
import { clayShadow, radii, spacing, typography } from "../../src/theme/tokens";

export default function TasksScreen() {
  const { colors, style: themeStyle } = useTheme();
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
      <Text style={{ ...typography.title, color: colors.ink, marginBottom: spacing.md }}>Tasks</Text>
      <Field label="Quick add" placeholder="Something small…" value={title} onChangeText={setTitle} />
      <Button label="Add task" onPress={() => void add()} loading={saving} />
      <FlatList
        style={{ marginTop: spacing.lg }}
        data={tasks}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<EmptyState title="All clear" body="Enjoy the quiet — or add one above." />}
        renderItem={({ item }) => (
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              padding: spacing.md,
              backgroundColor: colors.card,
              borderRadius: radii.md,
              marginBottom: spacing.sm,
              ...clayShadow(themeStyle, colors),
            }}
            onPress={() => void complete(item.id)}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: colors.warm,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.body, fontWeight: "600", color: colors.ink }}>{item.title}</Text>
              <Text style={{ ...typography.caption, color: colors.muted }}>
                {item.due_at ? new Date(item.due_at).toLocaleString() : "No due time"}
              </Text>
            </View>
            <Text style={{ ...typography.caption, color: colors.accent, fontWeight: "700" }}>Done</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
