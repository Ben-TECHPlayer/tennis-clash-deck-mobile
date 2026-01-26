import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Typage pour TypeScript
type GameCategory = "grand-tour" | "regular" | "tournaments";

export default function GamesScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<GameCategory>("regular");

  // Données pour la liste des niveaux de tournoi (plus propre à afficher)
  const tournamentLevels = [
    "🎯 Beginner – Max level 4 (if Tour 4 not unlocked)",
    "🥉 Rookie – Max level 6",
    "🥈 Junior – Max level 9",
    "🥇 Challenger – Max level 12",
    "🏆 Master – Max level 15",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* --- MENU DES ONGLETS --- */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedCategory === "grand-tour" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedCategory("grand-tour")}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === "grand-tour" && styles.tabTextActive,
              ]}
            >
              Grand Tour
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedCategory === "regular" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedCategory("regular")}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === "regular" && styles.tabTextActive,
              ]}
            >
              Regular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedCategory === "tournaments" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedCategory("tournaments")}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === "tournaments" && styles.tabTextActive,
              ]}
            >
              Tournaments
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- CONTENU DÉFILANT --- */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 1. REGULAR */}
          {selectedCategory === "regular" && (
            <View style={styles.card}>
              <Text style={styles.title}>📅 Season Matches (Regular)</Text>
              <Text style={styles.subTitle}>
                Available mode with every character, also those who have less
                than 2200 trophies.
              </Text>
              <Text style={styles.paragraph}>
                • We play only in the highest tour you have unlocked.
              </Text>
              <Text style={styles.paragraph}>
                • Ideal for training lower characters or testing new equipment.
              </Text>
              <Text style={styles.paragraph}>
                • These trophies won don't take into account in Grand Tour, but
                can help to reach 2200.
              </Text>
            </View>
          )}

          {/* 2. GRAND TOUR */}
          {selectedCategory === "grand-tour" && (
            <View style={styles.card}>
              <Text style={styles.title}>🌍 Grand Tour</Text>
              <Text style={styles.subTitle}>
                Tennis Clash's principal competitive mode.
              </Text>
              <Text style={styles.paragraph}>
                • Only available with a character who has at least 2200
                trophies.
              </Text>
              <Text style={styles.paragraph}>
                • Trophies taken into account are those of Grand Tour, not those
                of Regular mode.
              </Text>
              <Text style={styles.paragraph}>
                • It allows us to earn coins, cards, and contribute to club
                rankings.
              </Text>
              <Text style={styles.paragraph}>
                • Each win raises trophies of the character used.
              </Text>
            </View>
          )}

          {/* 3. TOURNAMENTS */}
          {selectedCategory === "tournaments" && (
            <View style={styles.card}>
              <Text style={styles.title}>🏅 Tournaments</Text>
              <Text style={styles.subTitle}>
                Free competitive events with rewards according to your ranking.
              </Text>

              <Text style={[styles.headerSmall, { marginTop: 10 }]}>
                5 Levels :
              </Text>

              {/* Simulation de la liste <ul> <li> */}
              <View style={styles.listContainer}>
                {tournamentLevels.map((level, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listText}>{level}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.paragraph}>
                • The higher my ranking is, the better my reward (coins, cards,
                gems).
              </Text>
              <Text style={styles.paragraph}>
                • Tournaments are often linked to special events or seasons.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  // --- STYLES DES ONGLETS (Tabs) ---
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontWeight: "600",
    color: "#666",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#007AFF",
    fontWeight: "bold",
  },

  // --- STYLES DU CONTENU ---
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  headerSmall: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  paragraph: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 12,
  },

  // --- LISTE À PUCES ---
  listContainer: {
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start", // Aligne le point en haut si le texte est long
  },
  listBullet: {
    fontSize: 16,
    marginRight: 8,
    color: "#007AFF",
  },
  listText: {
    fontSize: 14,
    color: "#333",
    flex: 1, // Permet au texte de passer à la ligne proprement
    lineHeight: 20,
  },
});
