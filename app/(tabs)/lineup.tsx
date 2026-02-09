import React, { useContext, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ChosenLineup from "../../components/ChosenLineup";
import SelectCard from "../../components/SelectCard";
import { LevelContext } from "../../context/LevelContext";

export default function LineupScreen() {
  // On utilise un système d'onglets interne ou un toggle pour ne pas encombrer l'écran
  // Car sur mobile, avoir la sélection ET le résultat sur le même écran prend trop de place.
  const [viewMode, setViewMode] = useState("input"); // 'input' (SelectCard) ou 'output' (ChosenLineup)

  // Réinitialiser les données
  const { resetAllLevels } = useContext(LevelContext);

  // Demander à l'utilisateur de confirmer s'il veut réinitialiser les données
  const handleReset = () => {
    if (window.confirm("Tout effacer ?")) {
      resetAllLevels("Are you sure you want to reset all cards to Level 0?");
      // setSelectedCardTable(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER AVEC TOGGLE */}
      <View style={styles.header}>
        <Text style={styles.title}>Dream Lineup Calculator</Text>

        <View style={styles.toggleContainer}>
          {/* Groupe des boutons centraux */}
          <View style={styles.centerButtons}>
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

          {/* Bouton Reset (Positionné en absolu à droite) */}
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reset All</Text>
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
    alignItems: "center",
    justifyContent: "center", // Centre le contenu principal (les boutons du milieu)
    position: "relative", // Important pour que le bouton Reset se place par rapport à ce conteneur
    marginTop: 10,
    width: "100%", // S'assure que le conteneur prend toute la largeur
    height: 50, // Donne une hauteur fixe pour faciliter l'alignement
  },

  centerButtons: {
    flexDirection: "row", // Garde les boutons 1 et 2 côte à côte
    gap: 10, // Espace entre les deux boutons (si React Native récent), sinon utilise marginHorizontal
  },

  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 18,
  },

  toggleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  toggleText: {
    fontWeight: "600",
    color: "#666",
  },

  toggleTextActive: {
    color: "#007AFF",
    fontWeight: "bold",
  },

  // Styles spécifiques pour le bouton Reset
  resetBtn: {
    position: "absolute", // Sort du flux pour se placer librement
    right: 0, // Se colle tout à droite
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  resetText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
