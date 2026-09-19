import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { api, EventItem, Task } from "../../src/api/client";
import { Button, EmptyState, Panel, Screen } from "../../src/components/ui";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, typography } from "../../src/theme/tokens";

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocalDay(iso: string) {
  return dayKey(new Date(iso));
}

type DayItem = {
  id: string;
  title: string;
  when: string;
  kind: "event" | "task";
  source?: string;
};

export default function PlanScreen() {
  const { colors } = useTheme();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => dayKey(new Date()));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1).toISOString();
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const [ev, tk] = await Promise.all([api.events(from, to), api.tasks("open")]);
    setEvents(ev);
    setTasks(tk);
  }, [cursor]);

  useFocusEffect(
    useCallback(() => {
      void load().catch(() => undefined);
    }, [load])
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    const push = (key: string, item: DayItem) => {
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    };
    for (const e of events) {
      push(parseLocalDay(e.start_at), {
        id: e.id,
        title: e.title,
        when: e.start_at,
        kind: "event",
        source: e.source,
      });
    }
    for (const t of tasks) {
      if (!t.due_at) continue;
      push(parseLocalDay(t.due_at), {
        id: t.id,
        title: t.title,
        when: t.due_at,
        kind: "task",
        source: t.source,
      });
    }
    for (const [, list] of map) list.sort((a, b) => a.when.localeCompare(b.when));
    return map;
  }, [events, tasks]);

  const monthCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ key: string; day: number | null; inMonth: boolean }> = [];
    for (let i = 0; i < startPad; i++) cells.push({ key: `pad-${i}`, day: null, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ key: dayKey(new Date(year, month, d)), day: d, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ key: `end-${cells.length}`, day: null, inMonth: false });
    }
    return cells;
  }, [cursor]);

  const selectedItems = itemsByDay.get(selected) || [];
  const selectedLabel = useMemo(() => {
    const [y, m, d] = selected.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [selected]);

  const removeItem = async (item: DayItem) => {
    if (item.source === "google") return;
    if (item.kind === "event") await api.deleteEvent(item.id);
    else await api.deleteTask(item.id);
    await load();
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <View>
            <Text style={{ ...typography.title, color: colors.ink }}>
              {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </Text>
            <Text style={{ ...typography.caption, color: colors.muted, marginTop: 4 }}>Your plan</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Button
              label="‹"
              variant="ghost"
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            />
            <Button
              label="Today"
              variant="ghost"
              onPress={() => {
                const now = new Date();
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelected(dayKey(now));
              }}
            />
            <Button
              label="›"
              variant="ghost"
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            />
          </View>
        </View>

        <Panel soft="sky" style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <Text
                key={`${d}-${i}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  ...typography.caption,
                  color: colors.muted,
                }}
              >
                {d}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {monthCells.map((cell) => {
              if (!cell.inMonth || cell.day == null) {
                return <View key={cell.key} style={{ width: "14.28%", height: 40 }} />;
              }
              const count = itemsByDay.get(cell.key)?.length || 0;
              const isSelected = cell.key === selected;
              const isToday = cell.key === dayKey(new Date());
              return (
                <Pressable
                  key={cell.key}
                  onPress={() => setSelected(cell.key)}
                  style={{
                    width: "14.28%",
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    backgroundColor: isSelected
                      ? colors.warmSoft
                      : isToday
                        ? colors.accentSoft
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      ...typography.body,
                      fontWeight: isSelected || isToday ? "700" : "500",
                      color: colors.ink,
                      fontSize: 13,
                    }}
                  >
                    {cell.day}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 3, minHeight: 5, marginTop: 2 }}>
                    {count > 0 ? (
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent }} />
                    ) : null}
                    {count > 1 ? (
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.warm }} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Panel>

        <Text style={{ ...typography.title, fontSize: 17, color: colors.ink, marginBottom: spacing.sm }}>
          {selectedLabel}
        </Text>

        {selectedItems.length ? (
          selectedItems.map((item) => (
            <View
              key={`${item.kind}-${item.id}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor:
                    item.source === "google"
                      ? colors.muted
                      : item.kind === "event"
                        ? colors.accent
                        : colors.warm,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.body, fontWeight: "600", color: colors.ink }}>{item.title}</Text>
                <Text style={{ ...typography.caption, color: colors.muted, marginTop: 2 }}>
                  {item.source === "google" ? "Google" : item.kind} ·{" "}
                  {new Date(item.when).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {item.kind === "task" ? (
                <Pressable onPress={() => void api.completeTask(item.id).then(load)}>
                  <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>Done</Text>
                </Pressable>
              ) : null}
              {item.source === "google" ? null : (
                <Pressable onPress={() => void removeItem(item)}>
                  <Text style={{ color: colors.muted, fontWeight: "700", fontSize: 12, marginLeft: 8 }}>
                    Remove
                  </Text>
                </Pressable>
              )}
            </View>
          ))
        ) : (
          <EmptyState title="Nothing yet" body="Ask LifeOS on Home to add something." />
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
