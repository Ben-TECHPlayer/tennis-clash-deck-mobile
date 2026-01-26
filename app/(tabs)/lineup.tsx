import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ChosenLineup from "../../components/ChosenLineup";
import SelectCard from "../../components/SelectCard";

export default function LineupScreen() {
  // On utilise un système d'onglets interne ou un toggle pour ne pas encombrer l'écran
  // Car sur mobile, avoir la sélection ET le résultat sur le même écran prend trop de place.
  const [viewMode, setViewMode] = useState("input"); // 'input' (SelectCard) ou 'output' (ChosenLineup)

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER AVEC TOGGLE */}
      <View style={styles.header}>
        <Text style={styles.title}>Dream Lineup Calculator</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "input" && styles.toggleBtnActive,
            ]}
            onPress={() => setViewMode("input")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "input" && styles.toggleTextActive,
              ]}
            >
              1. Select Levels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "output" && styles.toggleBtnActive,
            ]}
            onPress={() => setViewMode("output")}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "output" && styles.toggleTextActive,
              ]}
            >
              2. View Results
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENU */}
      <View style={{ flex: 1 }}>
        {viewMode === "input" ? (
          <SelectCard onCardPress={null} />
        ) : (
          <ChosenLineup />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 18 },
  toggleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: { fontWeight: "600", color: "#666" },
  toggleTextActive: { color: "#007AFF", fontWeight: "bold" },
});
