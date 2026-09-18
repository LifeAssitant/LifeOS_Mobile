import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { api, EventItem, Task } from "../../src/api/client";
import { EmptyState, Screen } from "../../src/components/ui";
import { colors, radii, spacing, typography } from "../../src/theme/tokens";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

export default function CalendarScreen() {
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    const from = startOfMonth(cursor).toISOString();
    const to = endOfMonth(cursor).toISOString();
    const [ev, tk] = await Promise.all([api.events(from, to), api.tasks("open")]);
    setEvents(ev);
    setTasks(tk.filter((t) => t.due_at && t.due_at >= from && t.due_at <= to));
  }, [cursor]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load])
  );

  const items = useMemo(() => {
    const mapped = [
      ...events.map((e) => ({
        id: e.id,
        title: e.title,
        when: e.start_at,
        kind: "event" as const,
      })),
      ...tasks.map((t) => ({
        id: t.id,
        title: t.title,
        when: t.due_at!,
        kind: "task" as const,
      })),
    ];
    return mapped.sort((a, b) => a.when.localeCompare(b.when));
  }, [events, tasks]);

  const label = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <Screen>
      <Text style={styles.title}>Calendar</Text>
      <View style={styles.nav}>
        <Text style={styles.navBtn} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          ‹
        </Text>
        <Text style={styles.month}>{label}</Text>
        <Text style={styles.navBtn} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          ›
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => `${i.kind}-${i.id}`}
        ListEmptyComponent={<EmptyState title="Quiet month" body="Add something from chat or tasks." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: item.kind === "event" ? colors.mint : colors.peach }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowMeta}>
                {item.kind} · {new Date(item.when).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.ink, marginBottom: spacing.md },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  month: { ...typography.body, fontWeight: "700", color: colors.ink },
  navBtn: { fontSize: 28, color: colors.ink, paddingHorizontal: 12 },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  rowTitle: { ...typography.body, fontWeight: "600", color: colors.ink },
  rowMeta: { ...typography.caption, color: colors.muted, marginTop: 2 },
});
