import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Définition d'un type pour les catégories (Bonne pratique TypeScript)
type ClubCategory = "rules" | "league-clubs" | "club-chelem";

export default function ClubsScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<ClubCategory>("rules");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* --- MENU DES ONGLETS (Tabs) --- */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedCategory === "rules" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedCategory("rules")}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === "rules" && styles.tabTextActive,
              ]}
            >
              Rules
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedCategory === "league-clubs" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedCategory("league-clubs")}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === "league-clubs" && styles.tabTextActive,
              ]}
            >
              League
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedCategory === "club-chelem" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedCategory("club-chelem")}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === "club-chelem" && styles.tabTextActive,
              ]}
            >
              Chelem
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- CONTENU DÉFILANT --- */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {selectedCategory === "rules" && (
            <View style={styles.section}>
              <Text style={styles.title}>📜 Rules</Text>
              <Text style={styles.paragraph}>
                • Each club can contain 50 members max.
              </Text>
              <Text style={styles.paragraph}>
                • Each member who searches a club can go in request, or open but
                not closed. In several clubs, you have to reach a number of
                trophies to enter.
              </Text>
              <Text style={styles.paragraph}>
                • We can of course create our dream club, it gives us the
                possibility to accept or refuse requests of players who want to
                enter.
              </Text>
              <Text style={styles.paragraph}>
                • To have rewards bags, we have to join a club in the first 48
                hours of the league.
              </Text>
              <Text style={styles.paragraph}>
                • Available to win points clubs in Grand Tour, Tournaments, and
                Regular Matches.
              </Text>
            </View>
          )}

          {selectedCategory === "league-clubs" && (
            <View style={styles.section}>
              <Text style={styles.title}>📊 League Clubs</Text>
              <Text style={styles.paragraph}>
                • Seasonal ranking is based on the number of points won by
                members of the club.
              </Text>
              <Text style={styles.paragraph}>
                • The clubs are grouped in leagues (Challenger, Master...)
                according to their performance.
              </Text>
              <Text style={styles.paragraph}>
                • The best clubs go up and the worst go down.
              </Text>
              <Text style={styles.paragraph}>
                • Each season takes one week. At the end, reward bags will be
                distributed.
              </Text>
              <Text style={styles.paragraph}>
                • Each table contains 100 clubs with an independent ranking.
              </Text>
            </View>
          )}

          {selectedCategory === "club-chelem" && (
            <View style={styles.section}>
              <Text style={styles.title}>🎾 Challenge Chelem</Text>
              <Text style={styles.subTitle}>
                Individual challenge for the club: 4 games to play each day (2
                on hard, 1 on clay, and 1 on grass).
              </Text>
              <Text style={styles.paragraph}>
                • Each character used must wait 24h before playing again.
              </Text>
              <Text style={styles.paragraph}>
                • It allows contributing to the Chelem score and earning
                rewards.
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
  // Styles des Onglets (Boutons du haut)
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Ombre Android
  },
  tabText: {
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#007AFF", // Bleu actif
    fontWeight: "bold",
  },
  // Styles du contenu texte
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  paragraph: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22, // Pour une meilleure lisibilité
    marginBottom: 10,
  },
});
