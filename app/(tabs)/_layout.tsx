import { Tabs } from "expo-router";
import { Text } from "react-native";

import { colors } from "../../src/theme/tokens";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.ink : colors.muted, fontSize: 12, fontWeight: "600" }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
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
          tabBarIcon: ({ focused }) => <TabLabel label="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => <TabLabel label="▦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => <TabLabel label="✓" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabLabel label="◍" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
