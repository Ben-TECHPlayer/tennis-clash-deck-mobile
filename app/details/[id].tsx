import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CARDS_DATA } from "../../data/cardData";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Gestion de l'ID (tableau ou string)
  const cardId = Array.isArray(id) ? id[0] : id;
  // On récupère la carte. Le "as any" permet d'éviter les erreurs TypeScript si les clés ne sont pas typées strictement.
  const card = (CARDS_DATA as any)[cardId];

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ padding: 20 }}>Carte introuvable : {cardId}</Text>
      </SafeAreaView>
    );
  }

  // --- 1. GÉNÉRATION DU TABLEAU SKILLS ---
  const renderSkillsTable = () => {
    const stats = card.stats || {};
    // On détermine le niveau max selon les données de stats disponibles
    const firstStatKey = Object.keys(stats)[0];
    const maxLevel = stats[firstStatKey] ? stats[firstStatKey].length : 0;

    const rows = [];
    for (let i = 0; i < maxLevel; i++) {
      rows.push(
        <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.rowEven]}>
          <Text style={[styles.cell, styles.cellLevel]}>{i + 1}</Text>
          <Text style={styles.cell}>
            {stats.agility ? stats.agility[i] : "-"}
          </Text>
          <Text style={styles.cell}>
            {stats.stamina ? stats.stamina[i] : "-"}
          </Text>
          <Text style={styles.cell}>{stats.serve ? stats.serve[i] : "-"}</Text>
          <Text style={styles.cell}>
            {stats.volley ? stats.volley[i] : "-"}
          </Text>
          <Text style={styles.cell}>
            {stats.forehand ? stats.forehand[i] : "-"}
          </Text>
          <Text style={styles.cell}>
            {stats.backhand ? stats.backhand[i] : "-"}
          </Text>
        </View>,
      );
    }
    return { rows, maxLevel };
  };

  const { rows: skillRows, maxLevel } = renderSkillsTable();

  // --- 2. GÉNÉRATION DU TABLEAU UPGRADE (DYNAMIQUE) ---
  const renderUpgradeTable = () => {
    const upgradeRows = [];

    // ICI : On récupère les coûts directement depuis la carte
    // Si la propriété n'existe pas encore dans cardData, on prend un tableau vide par sécurité
    const specificUpgradeCosts = card.upgradeCosts || [];

    for (let i = 0; i < maxLevel; i++) {
      const isMax = i === maxLevel - 1;

      // On cherche le coût pour l'index i.
      // Si on n'a pas de données pour ce niveau, on affiche des tirets.
      const costData = specificUpgradeCosts[i] || { cards: "-", coins: "-" };

      // Logique d'affichage (Gestion du "Free", "Unlocked" ou Valeur)
      let displayCards = "-";
      if (costData.cards === 0) displayCards = "Unlocked";
      else if (typeof costData.cards === "number")
        displayCards = `${costData.cards} 🃏`;
      else displayCards = String(costData.cards); // Affiche "-" si c'est "-"

      let displayCoins = "-";
      if (costData.coins === 0) displayCoins = "Free";
      else if (typeof costData.coins === "number")
        displayCoins = `${costData.coins.toLocaleString()} 💰`;
      else displayCoins = String(costData.coins);

      upgradeRows.push(
        <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.rowEven]}>
          {/* Colonne Niveau */}
          <Text style={[styles.cell, styles.cellLevel]}>
            {i + 1} {isMax && <Text style={{ fontSize: 8 }}> (MAX)</Text>}
          </Text>

          {/* Colonne Cartes */}
          <Text style={styles.cell}>{displayCards}</Text>

          {/* Colonne Coins */}
          <Text style={styles.cell}>{displayCoins}</Text>
        </View>,
      );
    }
    return upgradeRows;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER NAVIGATION */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {card.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* INFO CARTE EN-TÊTE */}
        <View style={styles.cardHeader}>
          <Image
            source={card.image}
            style={{ width: 70, height: 70, marginBottom: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.cardType}>{card.type}</Text>
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardLevelMax}>Max Level: {maxLevel}</Text>
          </View>
        </View>

        {/* --- TABLEAU 1 : SKILLS TABLE --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>⚔️ Skills Table</Text>
          <View style={styles.table}>
            {/* Header Skills */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.cellLevel]}>Lvl</Text>
              <Text style={styles.headerCell}>Agi</Text>
              <Text style={styles.headerCell}>Sta</Text>
              <Text style={styles.headerCell}>Ser</Text>
              <Text style={styles.headerCell}>Vol</Text>
              <Text style={styles.headerCell}>For</Text>
              <Text style={styles.headerCell}>Bac</Text>
            </View>
            {skillRows}
          </View>
        </View>

        {/* --- TABLEAU 2 : UPGRADE TABLE --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>⬆️ Upgrade Table</Text>

          {/* Vérification visuelle si pas de données */}
          {(!card.upgradeCosts || card.upgradeCosts.length === 0) && (
            <Text style={styles.missingDataText}>
              No upgrade data available yet.
            </Text>
          )}

          <View style={styles.table}>
            {/* Header Upgrade */}
            <View style={[styles.tableHeader, { backgroundColor: "#444" }]}>
              <Text style={[styles.headerCell, styles.cellLevel]}>Lvl</Text>
              <Text style={styles.headerCell}>Cards Required</Text>
              <Text style={styles.headerCell}>Coins Required</Text>
            </View>
            {renderUpgradeTable()}
          </View>
        </View>

        {/* Espace en bas */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header Navigation
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: { marginRight: 15, padding: 5 },
  backText: { fontSize: 16, color: "#007AFF", fontWeight: "500" },
  headerTitle: { fontSize: 18, fontWeight: "bold", flex: 1 },

  scrollContent: { padding: 20 },

  // Info Carte Header
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  imagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: "#f0f0f0",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardType: {
    color: "#888",
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  cardLevelMax: { fontSize: 12, color: "#007AFF", marginTop: 2 },

  // Sections
  sectionContainer: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },
  missingDataText: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 5,
    fontSize: 12,
  },

  // Tableaux (Commun)
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#222",
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowEven: { backgroundColor: "#f9f9f9" },

  // Cellules
  headerCell: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 11,
  },
  cell: { flex: 1, textAlign: "center", fontSize: 12, color: "#333" },
  cellLevel: { flex: 0.5, fontWeight: "bold", color: "#007AFF" },
});
