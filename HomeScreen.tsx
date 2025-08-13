import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import TopBar from "../components/TopBar";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../hooks/AuthContext";
import { analyzeHealthClaim } from "../lib/ai";
import type { AnalysisResult, AnalysisInput } from "../types/analysis";

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { email } = useAuth();

  // redirect to Login if not signed in
  useFocusEffect(
    useCallback(() => {
      if (!email) {
        nav.navigate("Login");
      }
    }, [email, nav])
  );

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [pdfMeta, setPdfMeta] = useState<{ name: string; size: number; type?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const disabled = useMemo(() => !url && !text && !pdfMeta, [url, text, pdfMeta]);

  const pickPdf = useCallback(async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf", multiple: false, copyToCacheDirectory: true });
    if (res.type === "success") {
      setPdfMeta({ name: res.name, size: res.size ?? 0, type: res.mimeType });
    }
  }, []);

  const clearPdf = useCallback(() => setPdfMeta(null), []);

  const onAnalyze = useCallback(async () => {
    if (disabled || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const input: AnalysisInput = { url: url.trim() || undefined, text: text.trim() || undefined, pdf: pdfMeta };
      const r = await analyzeHealthClaim(input, email ?? undefined);
      setResult(r);
    } catch (err: any) {
      setResult({
        verdict: "misinformation",
        confidence: 0.2,
        reasoning: err?.message ?? "Failed to analyze. Please try again.",
        citations: [
          { title: "Centers for Disease Control and Prevention", url: "https://www.cdc.gov/" },
        ],
        inputEcho: { url, text, pdf: pdfMeta },
        analyzedAt: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }, [disabled, loading, url, text, pdfMeta, email]);

  const verdictColor = (v?: string) =>
    v === "truth" ? "#16a34a" : v === "harmful" ? "#eab308" : v === "misinformation" ? "#ef4444" : "#94a3b8";

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Health Misinformation Checker</Text>
        <Text style={styles.sub}>Provide any of the inputs below. We'll analyze and cite authoritative sources.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>URL</Text>
          <TextInput
            placeholder="https://example.com/article"
            placeholderTextColor="#64748b"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={Platform.OS === "web" ? "url" : "default"}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Text</Text>
          <TextInput
            placeholder="Paste the health claim or text"
            placeholderTextColor="#64748b"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={5}
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          />

          <View style={{ height: 12 }} />
          <View style={styles.rowBetween}>
            <Text style={styles.label}>PDF</Text>
            {pdfMeta ? (
              <TouchableOpacity onPress={clearPdf}><Text style={styles.clear}>Remove</Text></TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity onPress={pickPdf} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>{pdfMeta ? `Selected: ${pdfMeta.name} (${Math.round((pdfMeta.size || 0) / 1024)} KB)` : "Upload PDF"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onAnalyze} disabled={disabled || loading} style={[styles.button, (disabled || loading) && { opacity: 0.6 }] }>
            <Text style={styles.buttonText}>{loading ? "Analyzing..." : "Analyze"}</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.result}>
            <Text style={styles.h2}>Result</Text>
            <View style={[styles.badge, { backgroundColor: verdictColor(result.verdict) }]}>
              <Text style={styles.badgeText}>{result.verdict.toUpperCase()}</Text>
            </View>
            <Text style={styles.reason}>{result.reasoning}</Text>
            <Text style={styles.citeTitle}>Citations</Text>
            {result.citations.map((c, idx) => (
              <Text key={idx} style={styles.citation}>
                • {c.title} — {c.url}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  content: { padding: 16 },
  h1: { color: "#e2e8f0", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  sub: { color: "#94a3b8", marginBottom: 12 },
  card: { backgroundColor: "#0f172a", borderRadius: 12, padding: 12 },
  label: { color: "#e2e8f0", fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    color: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secondaryButton: { marginTop: 6, backgroundColor: "#0b1220", borderColor: "#1f2937", borderWidth: 1, padding: 12, borderRadius: 8 },
  secondaryText: { color: "#cbd5e1" },
  button: { marginTop: 16, backgroundColor: "#2563eb", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
  clear: { color: "#fca5a5" },
  result: { marginTop: 16, backgroundColor: "#0f172a", padding: 12, borderRadius: 12 },
  h2: { color: "#e2e8f0", fontSize: 18, fontWeight: "600", marginBottom: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeText: { color: "white", fontWeight: "700" },
  reason: { color: "#cbd5e1", marginBottom: 10 },
  citeTitle: { color: "#e2e8f0", fontWeight: "600" },
  citation: { color: "#94a3b8", marginTop: 4 },
});