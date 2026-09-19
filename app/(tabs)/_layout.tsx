import { Tabs } from "expo-router";
import { Text, View } from "react-native";

import { useTheme } from "../../src/theme/ThemeContext";
import { clayAccent } from "../../src/theme/tokens";

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  const { colors, radii } = useTheme();
  if (!focused) {
    return (
      <View style={{ width: 38, height: 30, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.muted, fontSize: 15 }}>{glyph}</Text>
      </View>
    );
  }
  return (
    <View
      style={[
        clayAccent(colors, { radius: radii.sm, lift: 4 }),
        { width: 38, height: 30, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <Text style={{ color: colors.accentInk, fontSize: 15 }}>{glyph}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors, fonts } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.clayHi,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: colors.shadowColor,
          shadowOpacity: colors.shadowOpacity,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -6 },
          elevation: 12,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11.5 },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => <TabIcon glyph="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Plan",
          tabBarIcon: ({ focused }) => <TabIcon glyph="▦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => <TabIcon glyph="✓" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon glyph="◍" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
