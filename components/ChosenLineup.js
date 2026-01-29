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

  const [gameMode, setGameMode] = useState("grand-tour");
  const [levelCap, setLevelCap] = useState(15);

  const [minStats, setMinStats] = useState({
    ag: "",
    st: "",
    se: "",
    vo: "",
    fo: "",
    ba: "",
  });

  const [selectedLineup, setSelectedLineup] = useState(null);

  useEffect(() => {
    if (gameMode === "tournament") setLevelCap(9);
    if (gameMode === "grand-tour") setLevelCap(15);
  }, [gameMode]);

  const handleMinStatChange = (stat, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setMinStats((prev) => ({ ...prev, [stat]: numericValue }));
  };

  // ---------------------------------------------------------
  // VERSION FELIX HALIM — STATS + LEVEL CAP
  // ---------------------------------------------------------
  const computeStats = (stats, level) => {
    const i = Math.max(0, level - 1);
    const safe = (v) => (v === "-" || v == null ? 0 : Number(v));
    return {
      ag: safe(stats.agility?.[i]),
      st: safe(stats.stamina?.[i]),
      se: safe(stats.serve?.[i]),
      vo: safe(stats.volley?.[i]),
      fo: safe(stats.forehand?.[i]),
      ba: safe(stats.backhand?.[i]),
    };
  };

  const totalPower = (s) => s.ag + s.st + s.se + s.vo + s.fo + s.ba;

  const getEffectiveLevel = (item) => {
    let cap = levelCap;

    if (gameMode === "tournament") {
      cap = levelCap;
    }

    if (gameMode === "regular") {
      if (item.category === "Character") {
        cap = item.level >= 14 ? item.level : item.level + 2;
      }
    }

    return Math.min(item.level, cap);
  };

  // ---------------------------------------------------------
  // VERSION C — MEILLEURS ITEMS PAR CATÉGORIE (FELIX HALIM)
  // ---------------------------------------------------------
  const bestItems = useMemo(() => {
    if (!savedLevels || Object.keys(savedLevels).length === 0) return {};

    const cats = {
      Character: [],
      Racket: [],
      Grip: [],
      Shoe: [],
      Wristband: [],
      Nutrition: [],
      Workout: [],
    };

    Object.keys(savedLevels).forEach((path) => {
      const level = savedLevels[path];
      const data = CARDS_DATA[path];
      if (data && level > 0) {
        cats[data.type].push({
          id: path,
          name: data.name,
          category: data.type,
          level,
          stats: data.stats,
        });
      }
    });

    const result = {};

    Object.keys(cats).forEach((cat) => {
      const processed = cats[cat].map((item) => {
        const eff = getEffectiveLevel(item);
        const s = computeStats(item.stats, eff);
        return {
          ...item,
          effectiveLevel: eff,
          stats: s,
          totalPower: totalPower(s),
        };
      });

      processed.sort((a, b) => b.totalPower - a.totalPower);

      result[cat] = processed;
    });

    return result;
  }, [savedLevels, levelCap, gameMode]);

  // ---------------------------------------------------------
  // GENERATION DES LINEUPS (FILTRES APPLIQUÉS SUR LE TOTAL)
  // ---------------------------------------------------------
  const lineups = useMemo(() => {
    if (!bestItems.Character?.length) return [];

    const chars = bestItems.Character.slice(0, 10);
    const rackets = bestItems.Racket.slice(0, 10);
    const grips = bestItems.Grip.slice(0, 10);
    const shoes = bestItems.Shoe.slice(0, 5);
    const wrists = bestItems.Wristband.slice(0, 5);
    const nutritions = bestItems.Nutrition.slice(0, 5);
    const workouts = bestItems.Workout.slice(0, 5);

    const minAg = parseInt(minStats.ag || 0);
    const minSt = parseInt(minStats.st || 0);
    const minSe = parseInt(minStats.se || 0);
    const minVo = parseInt(minStats.vo || 0);
    const minFo = parseInt(minStats.fo || 0);
    const minBa = parseInt(minStats.ba || 0);

    const result = [];

    chars.forEach((c) => {
      rackets.forEach((r) => {
        grips.forEach((g) => {
          shoes.forEach((s) => {
            wrists.forEach((w) => {
              nutritions.forEach((n) => {
                workouts.forEach((wk) => {
                  const stats = {
                    ag:
                      c.stats.ag +
                      r.stats.ag +
                      g.stats.ag +
                      s.stats.ag +
                      w.stats.ag +
                      n.stats.ag +
                      wk.stats.ag,
                    st:
                      c.stats.st +
                      r.stats.st +
                      g.stats.st +
                      s.stats.st +
                      w.stats.st +
                      n.stats.st +
                      wk.stats.st,
                    se:
                      c.stats.se +
                      r.stats.se +
                      g.stats.se +
                      s.stats.se +
                      w.stats.se +
                      n.stats.se +
                      wk.stats.se,
                    vo:
                      c.stats.vo +
                      r.stats.vo +
                      g.stats.vo +
                      s.stats.vo +
                      w.stats.vo +
                      n.stats.vo +
                      wk.stats.vo,
                    fo:
                      c.stats.fo +
                      r.stats.fo +
                      g.stats.fo +
                      s.stats.fo +
                      w.stats.fo +
                      n.stats.fo +
                      wk.stats.fo,
                    ba:
                      c.stats.ba +
                      r.stats.ba +
                      g.stats.ba +
                      s.stats.ba +
                      w.stats.ba +
                      n.stats.ba +
                      wk.stats.ba,
                  };

                  // FILTRE SUR LE TOTAL DU LINEUP
                  if (
                    stats.ag >= minAg &&
                    stats.st >= minSt &&
                    stats.se >= minSe &&
                    stats.vo >= minVo &&
                    stats.fo >= minFo &&
                    stats.ba >= minBa
                  ) {
                    result.push({
                      items: { c, r, g, s, w, n, wk },
                      stats,
                      totalPower: totalPower(stats),
                    });
                  }
                });
              });
            });
          });
        });
      });
    });

    result.sort((a, b) => b.totalPower - a.totalPower);

    return result.slice(0, 200);
  }, [bestItems, minStats]);

  const dv = (v) => (v > 0 ? v : "-");

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
    <ScrollView style={styles.container}>
      {/* CONFIG */}
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

        <View style={styles.capRow}>
          <Text style={styles.label}>Level Cap:</Text>

          {gameMode === "tournament" && (
            <View style={styles.tournamentBtnContainer}>
              {[
                { label: "Rook (6)", val: 6 },
                { label: "Jun (9)", val: 9 },
                { label: "Chal (12)", val: 12 },
                { label: "Mast (15)", val: 15 },
              ].map((t) => (
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
          )}

          {gameMode === "regular" && (
            <Text style={{ fontStyle: "italic", color: "#666" }}>
              Auto (Character Lvl + 2)
            </Text>
          )}

          {gameMode === "grand-tour" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setLevelCap((c) => Math.max(1, c - 1))}
                style={styles.capBtn}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>-</Text>
              </TouchableOpacity>
              <Text
                style={{
                  marginHorizontal: 15,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
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
          )}
        </View>

        {/* FILTERS */}
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

      {/* LISTE DES LINEUPS */}
      <View style={styles.lineupList}>
        <Text style={styles.sectionTitle}>Possible Lineups</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingVertical: 10 }}
        >
          <View style={{ flexDirection: "row" }}>
            {lineups.map((l, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.horizontalItem,
                  selectedLineup === l && styles.horizontalItemSelected,
                ]}
                onPress={() => setSelectedLineup(l)}
              >
                <Text style={styles.gridRank}>#{idx + 1}</Text>
                <Text style={styles.gridPower}>Total {l.totalPower}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* LINEUP SELECTIONNÉ */}
      {selectedLineup && (
        <View style={styles.selectedCard}>
          <Text style={styles.sectionTitle}>Selected Lineup</Text>

          <View style={styles.selectedRow}>
            {/* LEFT COLUMN — ITEMS */}
            <View style={styles.leftColumn}>
              {Object.entries(selectedLineup.items).map(([key, item]) => {
                const fullNames = {
                  c: "Character",
                  r: "Racket",
                  g: "Grip",
                  s: "Shoe",
                  w: "Wristband",
                  n: "Nutrition",
                  wk: "Workout",
                };

                return (
                  <Text key={key} style={styles.itemName}>
                    {fullNames[key]} — {item.name} (Lvl {item.effectiveLevel})
                  </Text>
                );
              })}
            </View>

            {/* RIGHT COLUMN — STATS */}
            <View style={styles.rightColumn}>
              <Text style={styles.statLine}>
                Agility: {selectedLineup.stats.ag}
              </Text>
              <Text style={styles.statLine}>
                Stamina: {selectedLineup.stats.st}
              </Text>
              <Text style={styles.statLine}>
                Serve: {selectedLineup.stats.se}
              </Text>
              <Text style={styles.statLine}>
                Volley: {selectedLineup.stats.vo}
              </Text>
              <Text style={styles.statLine}>
                Forehand: {selectedLineup.stats.fo}
              </Text>
              <Text style={styles.statLine}>
                Backhand: {selectedLineup.stats.ba}
              </Text>
            </View>
          </View>

          <Text style={styles.totalPower}>
            TOTAL POWER: {selectedLineup.totalPower}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

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
  tournBtnActive: {
    backgroundColor: "#007AFF",
  },
  tournBtnText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },

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
  filterItem: {
    width: "31%",
    marginBottom: 10,
    alignItems: "center",
  },
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

  lineupList: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },

  lineupBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 8,
  },
  lineupBtnText: {
    fontWeight: "bold",
    color: "#333",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },

  selectedCard: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },

  itemRow: {
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },

  statsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  statLine: {
    fontSize: 13,
    marginBottom: 3,
  },
  totalPower: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    backgroundColor: "#f0f0f0",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  gridRank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  gridPower: {
    marginTop: 5,
    fontSize: 13,
    color: "#555",
  },

  horizontalItem: {
    width: 120,
    height: 80,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  selectedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },

  leftColumn: {
    flex: 1,
    alignItems: "flex-start",
  },

  rightColumn: {
    flex: 1,
    alignItems: "flex-end",
  },

  horizontalItemSelected: {
    backgroundColor: "#d0e8ff",
    borderWidth: 2,
    borderColor: "#007AFF",
    transform: [{ scale: 1.05 }],
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
