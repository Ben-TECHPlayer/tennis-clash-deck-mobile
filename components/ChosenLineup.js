import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LevelContext } from "../context/LevelContext";
import { CARDS_DATA } from "../data/cardData";

export default function ChosenLineup() {
  const { savedLevels } = useContext(LevelContext);

  // --- ÉTATS ---
  const [gameMode, setGameMode] = useState("grand-tour");
  const [levelCap, setLevelCap] = useState(15);
  const [selectedLineupIdx, setSelectedLineupIdx] = useState(0);

  const [minStats, setMinStats] = useState({
    ag: "",
    st: "",
    se: "",
    vo: "",
    fo: "",
    ba: "",
  });

  // --- EFFET : VALEURS PAR DÉFAUT SELON LE MODE ---
  useEffect(() => {
    if (gameMode === "tournament") setLevelCap(9); // Junior par défaut
    if (gameMode === "grand-tour") setLevelCap(15);
    // Regular : pas besoin de setLevelCap car c'est calculé dynamiquement
    setSelectedLineupIdx(0);
  }, [gameMode]);

  const handleMinStatChange = (stat, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setMinStats((prev) => ({ ...prev, [stat]: numericValue }));
    setSelectedLineupIdx(0);
  };

  // --- ALGORITHME DE CALCUL ---
  const lineups = useMemo(() => {
    if (!savedLevels || Object.keys(savedLevels).length === 0) return [];

    const itemsByCategory = {
      Character: [],
      Racket: [],
      Grip: [],
      Shoe: [],
      Wristband: [],
      Nutrition: [],
      Workout: [],
    };

    Object.keys(savedLevels).forEach((path) => {
      const trueLevel = savedLevels[path];
      const data = CARDS_DATA[path];
      if (data && trueLevel > 0) {
        itemsByCategory[data.type].push({
          id: path,
          name: data.name,
          category: data.type,
          trueLevel,
          rawStats: data.stats,
        });
      }
    });

    Object.keys(itemsByCategory).forEach((cat) => {
      if (itemsByCategory[cat].length === 0) {
        itemsByCategory[cat].push({
          name: "-",
          category: cat,
          trueLevel: 0,
          rawStats: {},
        });
      }
    });

    const generateCombinations = (catsIndex, currentBuild) => {
      const categories = Object.keys(itemsByCategory);
      if (catsIndex === categories.length) return [currentBuild];
      const category = categories[catsIndex];
      const items = itemsByCategory[category];
      let results = [];
      items.forEach((item) => {
        results = results.concat(
          generateCombinations(catsIndex + 1, {
            ...currentBuild,
            [category]: item,
          }),
        );
      });
      return results;
    };

    const rawLineups = generateCombinations(0, {});

    let processedLineups = rawLineups.map((lineupItems, index) => {
      let currentCap = levelCap;

      // --- LOGIQUE REGULAR : Max Character Level + 2 ---
      if (gameMode === "regular") {
        const char = lineupItems["Character"];
        // Si un perso est sélectionné, son cap est niveau + 2, sinon 15 par défaut
        currentCap = char && char.trueLevel > 0 ? char.trueLevel + 2 : 15;
      }

      const totalStats = { ag: 0, st: 0, se: 0, vo: 0, fo: 0, ba: 0 };
      const calculatedItems = {};

      Object.keys(lineupItems).forEach((cat) => {
        const item = lineupItems[cat];
        const effectiveLevel =
          item.trueLevel > 0 ? Math.min(item.trueLevel, currentCap) : 0;

        const stats = {
          ag: item.rawStats.agility?.[effectiveLevel - 1] || 0,
          st: item.rawStats.stamina?.[effectiveLevel - 1] || 0,
          se: item.rawStats.serve?.[effectiveLevel - 1] || 0,
          vo: item.rawStats.volley?.[effectiveLevel - 1] || 0,
          fo: item.rawStats.forehand?.[effectiveLevel - 1] || 0,
          ba: item.rawStats.backhand?.[effectiveLevel - 1] || 0,
        };
        Object.keys(totalStats).forEach((k) => (totalStats[k] += stats[k]));
        calculatedItems[cat] = { ...item, level: effectiveLevel, stats };
      });

      const totalPower = Object.values(totalStats).reduce((a, b) => a + b, 0);
      return {
        id: index + 1,
        items: calculatedItems,
        totals: totalStats,
        totalPower,
      };
    });

    // FILTRAGE
    processedLineups = processedLineups.filter((l) => {
      const minAg = parseInt(minStats.ag || 0);
      const minSt = parseInt(minStats.st || 0);
      const minSe = parseInt(minStats.se || 0);
      const minVo = parseInt(minStats.vo || 0);
      const minFo = parseInt(minStats.fo || 0);
      const minBa = parseInt(minStats.ba || 0);

      return (
        l.totals.ag >= minAg &&
        l.totals.st >= minSt &&
        l.totals.se >= minSe &&
        l.totals.vo >= minVo &&
        l.totals.fo >= minFo &&
        l.totals.ba >= minBa
      );
    });

    return processedLineups.sort((a, b) => b.totalPower - a.totalPower);
  }, [savedLevels, levelCap, gameMode, minStats]);

  const activeLineup = lineups[selectedLineupIdx] || null;
  const dv = (val) => (val > 0 ? val : "-");

  // --- RENDU UI CONDITIONNEL POUR LE CAP ---
  const renderLevelCapControls = () => {
    // CAS 1 : REGULAR (Auto)
    if (gameMode === "regular") {
      return (
        <View style={styles.capControlContainer}>
          <Text style={{ fontStyle: "italic", color: "#666" }}>
            Auto (Character Lvl + 2)
          </Text>
        </View>
      );
    }

    // CAS 2 : TOURNAMENT (Rookie, Junior, Challenger, Master)
    if (gameMode === "tournament") {
      const tournaments = [
        { label: "Rook (6)", val: 6 },
        { label: "Jun (9)", val: 9 },
        { label: "Chal (12)", val: 12 },
        { label: "Mast (15)", val: 15 },
      ];
      return (
        <View style={styles.tournamentBtnContainer}>
          {tournaments.map((t) => (
            <TouchableOpacity
              key={t.val}
              onPress={() => setLevelCap(t.val)}
              style={[
                styles.tournBtn,
                levelCap === t.val && styles.tournBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.tournBtnText,
                  levelCap === t.val && styles.textWhite,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // CAS 3 : GRAND TOUR (Standard +/-)
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => setLevelCap((c) => Math.max(1, c - 1))}
          style={styles.capBtn}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>-</Text>
        </TouchableOpacity>
        <Text
          style={{ marginHorizontal: 15, fontWeight: "bold", fontSize: 16 }}
        >
          {levelCap}
        </Text>
        <TouchableOpacity
          onPress={() => setLevelCap((c) => Math.min(15, c + 1))}
          style={styles.capBtn}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!savedLevels || Object.keys(savedLevels).length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: "center", color: "#888" }}>
          Please select items in the calculator above.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 1. CONFIGURATION */}
      <View style={styles.configCard}>
        <View style={styles.modeRow}>
          {["grand-tour", "regular", "tournament"].map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setGameMode(m)}
              style={[styles.modeBtn, gameMode === m && styles.modeBtnActive]}
            >
              <Text
                style={[
                  styles.modeText,
                  gameMode === m && styles.modeTextActive,
                ]}
              >
                {m === "grand-tour"
                  ? "Grand Tour"
                  : m === "regular"
                    ? "Regular"
                    : "Tournaments"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIGNE CAP CORRIGÉE */}
        <View style={styles.capRow}>
          <Text style={styles.label}>Level Cap:</Text>
          {/* Affichage dynamique selon le mode */}
          {renderLevelCapControls()}
        </View>

        <Text style={styles.filterTitle}>Min Stats Filter (0-100)</Text>
        <View style={styles.filterGrid}>
          {["ag", "st", "se", "vo", "fo", "ba"].map((statKey) => (
            <View key={statKey} style={styles.filterItem}>
              <Text style={styles.filterLabel}>{statKey.toUpperCase()}</Text>
              <TextInput
                style={[
                  styles.filterInput,
                  minStats[statKey] ? styles.filterInputActive : null,
                ]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#ccc"
                maxLength={3}
                value={minStats[statKey]}
                onChangeText={(val) => handleMinStatChange(statKey, val)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 2. ETAT VIDE */}
      {lineups.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text
            style={{
              color: "#D32F2F",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            No lineup matches these stats.{"\n"}Try lowering the filters.
          </Text>
        </View>
      ) : (
        <>
          {/* 3. SLIDER HORIZONTAL */}
          <View style={{ height: 60, marginBottom: 5 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
                paddingHorizontal: 10,
              }}
            >
              {lineups.map((l, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedLineupIdx(idx)}
                  style={[
                    styles.topLineupBtn,
                    selectedLineupIdx === idx && styles.topLineupBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.topLineupText,
                      selectedLineupIdx === idx && styles.textWhite,
                    ]}
                  >
                    #{idx + 1}
                  </Text>
                  <Text
                    style={[
                      styles.topLineupPower,
                      selectedLineupIdx === idx && styles.textWhite,
                    ]}
                  >
                    {l.totalPower}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 4. TABLEAU DÉTAILLÉ */}
          {activeLineup && (
            <View style={styles.detailCard}>
              <Text style={styles.detailHeader}>
                Selected Lineup #{selectedLineupIdx + 1}
              </Text>

              <View style={styles.rowHeader}>
                <Text style={[styles.colName, styles.headerText]}>Item</Text>
                <Text style={styles.colStatHeader}>Ag</Text>
                <Text style={styles.colStatHeader}>St</Text>
                <Text style={styles.colStatHeader}>Se</Text>
                <Text style={styles.colStatHeader}>Vo</Text>
                <Text style={styles.colStatHeader}>Fo</Text>
                <Text style={styles.colStatHeader}>Ba</Text>
              </View>

              {[
                "Character",
                "Racket",
                "Grip",
                "Shoe",
                "Wristband",
                "Nutrition",
                "Workout",
              ].map((cat, i) => {
                const item = activeLineup.items[cat] || {
                  name: "-",
                  level: 0,
                  stats: {},
                };
                const s = item.stats || {
                  ag: 0,
                  st: 0,
                  se: 0,
                  vo: 0,
                  fo: 0,
                  ba: 0,
                };

                return (
                  <View
                    key={cat}
                    style={[styles.row, i % 2 === 0 ? styles.rowAlt : null]}
                  >
                    <View style={styles.colName}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.catName}>
                        {cat} {item.level > 0 ? `(Lvl ${item.level})` : ""}
                      </Text>
                    </View>
                    <Text style={styles.colStat}>{dv(s.ag)}</Text>
                    <Text style={styles.colStat}>{dv(s.st)}</Text>
                    <Text style={styles.colStat}>{dv(s.se)}</Text>
                    <Text style={styles.colStat}>{dv(s.vo)}</Text>
                    <Text style={styles.colStat}>{dv(s.fo)}</Text>
                    <Text style={styles.colStat}>{dv(s.ba)}</Text>
                  </View>
                );
              })}

              <View style={styles.rowTotal}>
                <Text
                  style={[
                    styles.colName,
                    { fontWeight: "bold", color: "white" },
                  ]}
                >
                  TOTAL
                </Text>
                <Text style={styles.colStatTotal}>
                  {activeLineup.totals.ag}
                </Text>
                <Text style={styles.colStatTotal}>
                  {activeLineup.totals.st}
                </Text>
                <Text style={styles.colStatTotal}>
                  {activeLineup.totals.se}
                </Text>
                <Text style={styles.colStatTotal}>
                  {activeLineup.totals.vo}
                </Text>
                <Text style={styles.colStatTotal}>
                  {activeLineup.totals.fo}
                </Text>
                <Text style={styles.colStatTotal}>
                  {activeLineup.totals.ba}
                </Text>
              </View>

              <View style={styles.powerBox}>
                <Text style={styles.powerText}>
                  TOTAL POWER: {activeLineup.totalPower}
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { paddingBottom: 50 },

  configCard: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },

  modeRow: { flexDirection: "row", justifyContent: "center", marginBottom: 15 },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 3,
    borderRadius: 20,
  },
  modeBtnActive: { backgroundColor: "#333" },
  modeText: { fontSize: 11, fontWeight: "bold", color: "#555" },
  modeTextActive: { color: "white" },

  // Modification ici pour supporter les boutons de tournoi
  capRow: { flexDirection: "column", alignItems: "center", marginBottom: 15 },
  label: { fontWeight: "bold", fontSize: 14, color: "#333", marginBottom: 5 },
  capBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  // Styles spécifiques Tournoi
  tournamentBtnContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
  },
  tournBtn: {
    backgroundColor: "#eee",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    margin: 2,
  },
  tournBtnActive: { backgroundColor: "#007AFF" },
  tournBtnText: { fontSize: 10, fontWeight: "bold", color: "#333" },

  filterTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterItem: { width: "31%", marginBottom: 10, alignItems: "center" },
  filterLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 3,
  },
  filterInput: {
    width: "100%",
    height: 38,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    textAlign: "center",
    backgroundColor: "#fafafa",
    color: "#333",
    fontSize: 14,
  },
  filterInputActive: {
    borderColor: "#007AFF",
    backgroundColor: "#e3f2fd",
    fontWeight: "bold",
  },

  emptyBox: { padding: 30, alignItems: "center", justifyContent: "center" },

  topLineupBtn: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  topLineupBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  topLineupText: { fontSize: 10, fontWeight: "bold", color: "#333" },
  topLineupPower: { fontSize: 12, fontWeight: "bold", color: "#007AFF" },
  textWhite: { color: "white" },

  detailCard: {
    backgroundColor: "white",
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  detailHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },

  rowHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#333",
    paddingBottom: 5,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  rowAlt: { backgroundColor: "#f9f9f9" },
  rowTotal: {
    flexDirection: "row",
    backgroundColor: "#333",
    paddingVertical: 10,
    marginTop: 5,
    borderRadius: 4,
    alignItems: "center",
  },

  colName: { flex: 1, paddingRight: 5 },
  colStatHeader: {
    width: 30,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold",
    color: "#555",
  },
  colStat: { width: 30, textAlign: "center", fontSize: 11, color: "#333" },
  colStatTotal: {
    width: 30,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },

  headerText: { fontSize: 12, fontWeight: "bold", color: "#333" },
  itemName: { fontSize: 12, fontWeight: "bold", color: "#000" },
  catName: { fontSize: 10, color: "#888" },

  powerBox: {
    marginTop: 15,
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
  },
  powerText: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
});
