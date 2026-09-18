import { Link } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { BrandMark, Button, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { colors, spacing, typography } from "../../src/theme/tokens";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <BrandMark subtitle="A calm companion for your day" />
        <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button label="Sign in" onPress={onSubmit} loading={loading} />
        <View style={styles.footer}>
          <Text style={styles.muted}>New here?</Text>
          <Link href="/(auth)/register" style={styles.link}>
            Create account
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: spacing.lg, alignItems: "center", gap: 6 },
  muted: { ...typography.body, color: colors.muted },
  link: { ...typography.body, fontWeight: "700", color: colors.ink },
});
