import React, { useContext, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LevelContext } from "../context/LevelContext";
import { CARDS_DATA } from "../data/cardData";

const MAIN_CATEGORIES = [
  "Character",
  "Racket",
  "Grip",
  "Shoe",
  "Wristband",
  "Nutrition",
  "Workout",
];

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 20;

export default function SelectCard({ onCardPress }) {
  const { savedLevels, updateLevel } = useContext(LevelContext);

  const [activeCategory, setActiveCategory] = useState("Character");
  const [characterSubFilter, setCharacterSubFilter] = useState("Legends");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCardKey, setSelectedCardKey] = useState(null);

  // -----------------------------
  // 🔥 FILTRE CORRIGÉ (ROBUSTE)
  // -----------------------------
  const items = Object.keys(CARDS_DATA).filter((key) => {
    const item = CARDS_DATA[key];

    if (activeCategory === "Character") {
      if (characterSubFilter === "Legends") {
        return item.typeCharacter === "Legends";
      } else {
        return item.typeCharacter === "Champions";
      }
    }

    return item.type === activeCategory;
  });

  const handlePress = (key) => {
    if (onCardPress) {
      onCardPress(key);
      return;
    }
    setSelectedCardKey(key);
    setModalVisible(true);
  };

  const confirmLevel = (level) => {
    if (selectedCardKey) updateLevel(selectedCardKey, level);
    setModalVisible(false);
    setSelectedCardKey(null);
  };

  // -----------------------------
  // 🔥 maxLevel venant du cardData
  // -----------------------------
  const max = CARDS_DATA[selectedCardKey]?.maxLevel || 15;

  // -----------------------------
  // 🔥 TABLEAUX (stats + costs)
  // -----------------------------
  const renderModalContent = () => {
    if (!selectedCardKey) return null;

    const card = CARDS_DATA[selectedCardKey];
    const stats = card.stats || {};
    const upgradeCosts = card.upgradeCosts || [];
    const maxLevel = card.maxLevel || 15;

    return (
      <View>
        {/* TABLEAU STATS */}
        <Text style={styles.tableTitle}>⚔️ Skills Stats</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: 30 }]}>Lvl</Text>
            <Text style={styles.th}>Agi</Text>
            <Text style={styles.th}>Sta</Text>
            <Text style={styles.th}>Ser</Text>
            <Text style={styles.th}>Vol</Text>
            <Text style={styles.th}>For</Text>
            <Text style={styles.th}>Bac</Text>
          </View>

          {Array.from({ length: maxLevel }).map((_, i) => (
            <View
              key={i}
              style={[styles.tableRow, i % 2 !== 0 && styles.rowAlt]}
            >
              <Text
                style={[
                  styles.td,
                  { width: 30, fontWeight: "bold", color: "#007AFF" },
                ]}
              >
                {i + 1}
              </Text>

              <Text style={styles.td}>{stats.agility?.[i] ?? "-"}</Text>
              <Text style={styles.td}>{stats.stamina?.[i] ?? "-"}</Text>
              <Text style={styles.td}>{stats.serve?.[i] ?? "-"}</Text>
              <Text style={styles.td}>{stats.volley?.[i] ?? "-"}</Text>
              <Text style={styles.td}>{stats.forehand?.[i] ?? "-"}</Text>
              <Text style={styles.td}>{stats.backhand?.[i] ?? "-"}</Text>
            </View>
          ))}
        </View>

        {/* TABLEAU UPGRADE COSTS */}
        <Text style={styles.tableTitle}>⬆️ Upgrade Costs</Text>
        <View style={styles.tableContainer}>
          <View style={[styles.tableHeaderRow, { backgroundColor: "#444" }]}>
            <Text style={[styles.th, { width: 40 }]}>Lvl</Text>
            <Text style={styles.th}>Cards</Text>
            <Text style={styles.th}>Coins</Text>
          </View>

          {upgradeCosts.length === 0 ? (
            <View style={{ padding: 10 }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                No upgrade data available.
              </Text>
            </View>
          ) : (
            upgradeCosts
              .filter((c) => c.level <= maxLevel)
              .map((cost, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 !== 0 && styles.rowAlt]}
                >
                  <Text
                    style={[
                      styles.td,
                      { width: 40, fontWeight: "bold", color: "#007AFF" },
                    ]}
                  >
                    {cost.level}
                  </Text>
                  <Text style={styles.td}>
                    {cost.cards === 0 ? "Unlocked" : cost.cards}
                  </Text>
                  <Text style={styles.td}>
                    {cost.coins === 0 ? "Free" : cost.coins.toLocaleString()}
                  </Text>
                </View>
              ))
          )}
        </View>
      </View>
    );
  };

  // -----------------------------
  // 🔥 RENDU PRINCIPAL
  // -----------------------------
  return (
    <View style={styles.container}>
      {/* TABS */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {MAIN_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.tabButton,
                activeCategory === cat && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === cat && styles.tabTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SUB-TABS */}
      {activeCategory === "Character" && (
        <View style={styles.subTabsContainer}>
          <TouchableOpacity
            onPress={() => setCharacterSubFilter("Legends")}
            style={[
              styles.subTabButton,
              characterSubFilter === "Legends" && styles.subTabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                characterSubFilter === "Legends" && styles.subTabTextActive,
              ]}
            >
              Legends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCharacterSubFilter("Champions")}
            style={[
              styles.subTabButton,
              characterSubFilter === "Champions" && styles.subTabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                characterSubFilter === "Champions" && styles.subTabTextActive,
              ]}
            >
              Champions
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* GRID */}
      <ScrollView contentContainerStyle={styles.grid}>
        {items.map((key) => {
          const item = CARDS_DATA[key];
          const currentLevel = savedLevels[key] || 0;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.card,
                !onCardPress && currentLevel > 0 && styles.cardActive,
              ]}
              onPress={() => handlePress(key)}
            >
              <Image
                source={item.image}
                style={{ width: 70, height: 70, marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.cardTitle}>{item.name}</Text>

              {!onCardPress && (
                <Text style={styles.levelText}>
                  {currentLevel > 0 ? `Lvl ${currentLevel}` : "Select"}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {items.length === 0 && (
          <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
            <Text style={{ color: "#999" }}>
              No items found in this category.
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCardKey ? CARDS_DATA[selectedCardKey].name : ""}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 20, color: "#999" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Select Level:</Text>

              <View style={styles.levelGrid}>
                {[...Array(max)].map((_, i) => {
                  const lvl = i + 1;
                  const isSelected =
                    selectedCardKey && savedLevels[selectedCardKey] === lvl;

                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.levelBtn,
                        isSelected && styles.levelBtnActive,
                      ]}
                      onPress={() => confirmLevel(lvl)}
                    >
                      <Text
                        style={[
                          styles.levelBtnText,
                          isSelected && styles.levelBtnTextActive,
                        ]}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => confirmLevel(0)}
              >
                <Text style={styles.removeBtnText}>Reset to Level 0</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {renderModalContent()}

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  tabsContainer: {
    height: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabsContent: { alignItems: "center", paddingHorizontal: 10 },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  tabButtonActive: { backgroundColor: "#007AFF" },
  tabText: { fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#fff" },

  subTabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  subTabButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 5,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subTabButtonActive: { backgroundColor: "#333", borderColor: "#333" },
  subTabText: { fontSize: 13, fontWeight: "600", color: "#555" },
  subTabTextActive: { color: "#FFD700" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
  },
  cardActive: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#e8f5e9",
  },

  cardTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 5,
  },
  levelText: { color: "#666", fontSize: 12 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold" },
  sectionLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 15,
  },
  levelBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  levelBtnActive: { backgroundColor: "#007AFF" },
  levelBtnText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  levelBtnTextActive: { color: "white" },

  removeBtn: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  removeBtnText: { color: "#D32F2F", fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 15 },

  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#333",
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
  },
  rowAlt: { backgroundColor: "#f9f9f9" },
  th: {
    flex: 1,
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  td: { flex: 1, fontSize: 11, textAlign: "center", color: "#333" },
});
