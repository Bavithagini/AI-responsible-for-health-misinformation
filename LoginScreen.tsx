import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigation<any>();
  const { signIn } = useAuth();

  const onSubmit = useCallback(() => {
    const trimmed = email.trim();
    const ok = /.+@.+\..+/.test(trimmed);
    if (!ok) {
      setError("Enter a valid email");
      return;
    }
    setError(null);
    signIn(trimmed);
    nav.navigate("Home");
  }, [email, nav, signIn]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Enter your email to continue</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={onSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    color: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  error: { color: "#fca5a5", marginTop: 8 },
  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
});