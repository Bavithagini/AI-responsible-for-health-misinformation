import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopBar from "../components/TopBar";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>About MedFact</Text>
        <Text style={styles.p}>
          MedFact is an AI-powered portal focused on identifying health misinformation and harmful claims online. Paste a URL, enter a statement, or upload a PDF, and MedFact provides a safety-first verdict along with citations to authoritative sources.
        </Text>
        <Text style={styles.h2}>How it works</Text>
        <Text style={styles.p}>
          We analyze your input with an AI model aligned to healthcare safety guidance. It classifies content as "truth", "harmful", or "misinformation" and includes citations from reputable organizations like WHO, CDC, and peer-reviewed journals.
        </Text>
        <Text style={styles.h2}>Limitations</Text>
        <Text style={styles.p}>
          MedFact is not a substitute for professional medical advice. Always consult healthcare professionals for personal medical decisions.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  content: { padding: 16 },
  h1: { color: "#e2e8f0", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  h2: { color: "#e2e8f0", fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  p: { color: "#94a3b8", lineHeight: 20 },
});