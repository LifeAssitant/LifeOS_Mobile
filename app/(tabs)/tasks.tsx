import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api, Task } from "../../src/api/client";
import { Button, EmptyState, Field, Screen } from "../../src/components/ui";
import { scheduleLocalReminder } from "../../src/notifications";
import { colors, radii, spacing, typography } from "../../src/theme/tokens";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await api.tasks("open");
    setTasks(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
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
      await scheduleLocalReminder(task.id, "Task reminder", task.title, new Date(due.getTime() - 15 * 60 * 1000));
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
      <Text style={styles.title}>Tasks</Text>
      <Field label="Quick add" placeholder="Something small…" value={title} onChangeText={setTitle} />
      <Button label="Add task" onPress={add} loading={saving} />
      <FlatList
        style={{ marginTop: spacing.lg }}
        data={tasks}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<EmptyState title="All clear" body="Enjoy the quiet — or add one above." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => complete(item.id)}>
            <View style={styles.check} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowMeta}>
                {item.due_at ? new Date(item.due_at).toLocaleString() : "No due time"}
              </Text>
            </View>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.ink, marginBottom: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.peach,
  },
  rowTitle: { ...typography.body, fontWeight: "600", color: colors.ink },
  rowMeta: { ...typography.caption, color: colors.muted },
  done: { ...typography.caption, color: colors.success, fontWeight: "700" },
});
