import { Tabs } from "expo-router";
import { Text } from "react-native";

import { useTheme } from "../../src/theme/ThemeContext";

function TabLabel({ label, focused, color, muted }: { label: string; focused: boolean; color: string; muted: string }) {
  return (
    <Text style={{ color: focused ? color : muted, fontSize: 12, fontWeight: "600" }}>{label}</Text>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabLabel label="◎" focused={focused} color={colors.ink} muted={colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Plan",
          tabBarIcon: ({ focused }) => (
            <TabLabel label="▦" focused={focused} color={colors.ink} muted={colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabLabel label="✓" focused={focused} color={colors.ink} muted={colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabLabel label="◍" focused={focused} color={colors.ink} muted={colors.muted} />
          ),
        }}
      />
    </Tabs>
  );
}
