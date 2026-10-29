import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AuthCard, Button, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { isSupabaseConfigured } from "../../src/supabase";
import { useTheme } from "../../src/theme/ThemeContext";
import { spacing } from "../../src/theme/tokens";

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const { colors, type } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    if (!adultConfirmed) {
      Alert.alert("Age confirmation required", "You must confirm that you are 18 or older.");
      return;
    }
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
    if (!adultConfirmed) {
      Alert.alert("Age confirmation required", "You must confirm that you are 18 or older.");
      return;
    }
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
            subtitle="Pick up where your day left off."
            footer={
              <View style={{ alignItems: "center", gap: 6 }}>
                <Text style={[type.body, { color: colors.muted }]}>New here?</Text>
                <Link href="/(auth)/register" style={[type.label, { color: colors.ink }]}>
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
              style={[
                type.caption,
                { color: colors.muted, textAlign: "center", marginVertical: spacing.xs },
              ]}
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
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="I confirm I am 18 or older"
              accessibilityState={{ checked: adultConfirmed }}
              onPress={() => setAdultConfirmed((value) => !value)}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 }}
            >
              <Text style={[type.label, { color: colors.accent }]}>
                {adultConfirmed ? "☑" : "☐"}
              </Text>
              <Text style={[type.caption, { color: colors.muted, flex: 1, lineHeight: 19 }]}>
                I confirm I am 18 or older.
              </Text>
            </Pressable>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: -8 }}>
              <Text style={[type.caption, { color: colors.muted }]}>Read our</Text>
              <Text
                style={[type.caption, { color: colors.ink, textDecorationLine: "underline" }]}
                onPress={() => void Linking.openURL("https://brainlesshuman.com/terms")}
              >
                Terms
              </Text>
              <Text style={[type.caption, { color: colors.muted }]}>and</Text>
              <Text
                style={[type.caption, { color: colors.ink, textDecorationLine: "underline" }]}
                onPress={() => void Linking.openURL("https://brainlesshuman.com/privacy")}
              >
                Privacy Policy
              </Text>
              <Text style={[type.caption, { color: colors.muted }]}>before continuing.</Text>
            </View>
            <Button label="Sign in" onPress={onSubmit} loading={loading} />
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
