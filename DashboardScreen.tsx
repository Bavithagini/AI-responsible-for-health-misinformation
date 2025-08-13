import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import TopBar from "../components/TopBar";
import { useAuth } from "../hooks/AuthContext";

export default function DashboardScreen() {
  const { analyses } = useAuth();

  const stats = useMemo(() => ({
    total: analyses.length,
    truth: analyses.filter((a) => a.verdict === "truth").length,
    harmful: analyses.filter((a) => a.verdict === "harmful").length,
    misinfo: analyses.filter((a) => a.verdict === "misinformation").length,
  }), [analyses]);

  const verdictColor = (v?: string) =>
    v === "truth" ? "#16a34a" : v === "harmful" ? "#eab308" : v === "misinformation" ? "#ef4444" : "#94a3b8";

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Dashboard</Text>
        <View style={styles.row}>
          <View style={styles.stat}><Text style={styles.statLabel}>Total</Text><Text style={styles.statValue}>{stats.total}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Truth</Text><Text style={styles.statValue}>{stats.truth}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Harmful</Text><Text style={styles.statValue}>{stats.harmful}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Misinformation</Text><Text style={styles.statValue}>{stats.misinfo}</Text></View>
        </View>

        <Text style={[styles.h2, { marginTop: 24 }]}>Recent Analyses</Text>
        {analyses.length === 0 ? (
          <Text style={styles.empty}>No data yet. Run an analysis from Home.</Text>
        ) : (
          analyses.map((a, idx) => (
            <View key={idx} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTime}>{new Date(a.analyzedAt).toLocaleString()}</Text>
                <View style={[styles.badge, { backgroundColor: verdictColor(a.verdict) }]}>
                  <Text style={styles.badgeText}>{a.verdict.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.itemInput} numberOfLines={2}>{a.inputEcho.text ?? a.inputEcho.url ?? (a.inputEcho.pdf ? a.inputEcho.pdf.name : '—')}</Text>
              <Text style={styles.itemReason} numberOfLines={3}>{a.reasoning}</Text>
              <View style={styles.citations}>
                {a.citations.map((c, i) => (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(c.url)}>
                    <Text style={styles.citation}>• {c.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  content: { padding: 16, paddingBottom: 64 },
  h1: { color: "#e2e8f0", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  h2: { color: "#e2e8f0", fontSize: 18, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", gap: 12 },
  stat: { backgroundColor: "#0f172a", padding: 12, borderRadius: 10, minWidth: 100 },
  statLabel: { color: "#94a3b8", fontSize: 12 },
  statValue: { color: "#e2e8f0", fontSize: 18, fontWeight: "700" },
  empty: { color: "#94a3b8" },
  item: { backgroundColor: "#0f172a", padding: 12, borderRadius: 10, marginTop: 12 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTime: { color: "#94a3b8", fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "white", fontWeight: "700" },
  itemInput: { color: "#e2e8f0", marginTop: 8 },
  itemReason: { color: "#cbd5e1", marginTop: 8 },
  citations: { marginTop: 8 },
  citation: { color: "#60a5fa", textDecorationLine: "underline", marginTop: 4 },
});