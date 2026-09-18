import { Link } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { BrandMark, Button, Field, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/context/AuthContext";
import { colors, spacing, typography } from "../../src/theme/tokens";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <BrandMark subtitle="Let’s keep life gentle and clear" />
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Field label="Password (min 8 characters)" secureTextEntry value={password} onChangeText={setPassword} />
        <Button label="Create account" onPress={onSubmit} loading={loading} />
        <View style={styles.footer}>
          <Text style={styles.muted}>Already have an account?</Text>
          <Link href="/(auth)/login" style={styles.link}>
            Sign in
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
