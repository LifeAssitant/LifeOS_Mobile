import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AuthCard, Button, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { isSupabaseConfigured } from "../../src/supabase";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, typography } from "../../src/theme/tokens";

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert("Could not sign in", err instanceof Error ? err.message : "Try again");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Add supabaseUrl and supabaseAnonKey to app.json");
      }
      await loginWithGoogle();
    } catch (err) {
      Alert.alert("Google sign-in", err instanceof Error ? err.message : "Try again");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <AuthCard
            title="Welcome back"
            subtitle="Your calm AI life manager"
            footer={
              <View style={{ alignItems: "center", gap: 6 }}>
                <Text style={{ ...typography.body, color: colors.muted }}>New here?</Text>
                <Link href="/(auth)/register" style={{ ...typography.body, fontWeight: "700", color: colors.accent }}>
                  Create account
                </Link>
              </View>
            }
          >
            <Button
              label={googleLoading ? "Opening Google…" : "Continue with Google"}
              variant="ghost"
              onPress={() => void onGoogle()}
              loading={googleLoading}
            />
            <Text
              style={{
                ...typography.caption,
                color: colors.muted,
                textAlign: "center",
                marginVertical: spacing.sm,
              }}
            >
              or continue with email
            </Text>
            <Field
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
            />
            <Field
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
            />
            <Button label="Sign in" onPress={onSubmit} loading={loading} />
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
