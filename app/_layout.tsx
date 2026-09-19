import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { registerForPushNotifications } from "../src/notifications";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { colors, scheme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (!user && !inAuth) {
      router.replace("/(auth)/login");
      return;
    }
    if (user && !user.onboarding_completed && !inOnboarding) {
      router.replace("/(onboarding)/welcome");
      return;
    }
    if (user && user.onboarding_completed && (inAuth || inOnboarding)) {
      router.replace("/(tabs)/home");
    }
  }, [user, loading, segments, router]);

  useEffect(() => {
    if (user) {
      registerForPushNotifications().catch(() => undefined);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.warm} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {children}
    </>
  );
}

function ThemedStack() {
  const { colors } = useTheme();
  return (
    <Guard>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </Guard>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
