import { Link } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { AuthCard, Button, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { isSupabaseConfigured } from "../../src/supabase";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing, typography } from "../../src/theme/tokens";

export default function RegisterScreen() {
  const { register, loginWithGoogle } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Check email", "Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Check password", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name || undefined);
    } catch (err) {
      Alert.alert("Could not register", err instanceof Error ? err.message : "Try again");
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
      Alert.alert("Google sign-up", err instanceof Error ? err.message : "Try again");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <AuthCard
            title="Create your space"
            subtitle="Plan gently. Stay clear."
            footer={
              <View style={{ alignItems: "center", gap: 6 }}>
                <Text style={{ ...typography.body, color: colors.muted }}>Already have an account?</Text>
                <Link href="/(auth)/login" style={{ ...typography.body, fontWeight: "700", color: colors.accent }}>
                  Sign in
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
            <Field label="Name" value={name} onChangeText={setName} placeholder="Optional" />
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
              placeholder="At least 8 characters"
            />
            <Button label="Create account" onPress={onSubmit} loading={loading} />
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
