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

  const [gameMode, setGameMode] = useState("grand-tour"); // "grand-tour" | "regular" | "tournament"
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

  // ---------------------------------------------------------
  // 1. EFFET DE RESET (SYNCHRONISATION)
  // ---------------------------------------------------------
  // Dès que le mode change ou que la liste des résultats change,
  // on désélectionne le lineup affiché pour éviter d'afficher un "fantôme" (ex: Kyrgios lvl 15 en mode Regular).
  useEffect(() => {
    setSelectedLineup(null);
  }, [gameMode, levelCap, minStats]);
  // Note: On dépend ici des inputs, mais on pourrait dépendre de 'lineups' directement.

  // ---------------------------------------------------------
  // 2. GESTION DES CAPS PAR DÉFAUT
  // ---------------------------------------------------------
  useEffect(() => {
    if (gameMode === "tournament") setLevelCap(9); // Junior par défaut
    if (gameMode === "grand-tour") setLevelCap(15);
    // En regular, le cap est dynamique (Char + 2), mais on met 15 par défaut pour l'UI
    if (gameMode === "regular") setLevelCap(15);
  }, [gameMode]);

  const handleMinStatChange = (stat, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setMinStats((prev) => ({ ...prev, [stat]: numericValue }));
  };

  // Helper pour extraire la stat à un niveau précis
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

  // ---------------------------------------------------------
  // 3. BEST ITEMS (TRI INITIAL)
  // ---------------------------------------------------------
  // Cette étape sert à sélectionner les 10 meilleurs items "potentiels"
  // pour éviter de faire des boucles sur des items inutiles.
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
          stats: data.stats, // Stats brutes (tous les niveaux)
        });
      }
    });

    const result = {};

    Object.keys(cats).forEach((cat) => {
      const processed = cats[cat].map((item) => {
        // Pour le TRI, si on est en Regular, on considère le niveau Max (15)
        // pour être sûr de garder les meilleurs items dans le top, même s'ils seront bridés après.
        // Sinon (Tournament), on respecte le Cap strict dès le début.
        let sortingCap = levelCap;
        if (gameMode === "regular") sortingCap = 15;
        if (gameMode === "tournament") sortingCap = levelCap;

        const eff = Math.min(item.level, sortingCap);
        const s = computeStats(item.stats, eff);

        return {
          ...item,
          effectiveLevel: eff,
          calculatedStats: s,
          totalPower: totalPower(s),
        };
      });

      // On trie du plus fort au plus faible et on garde le top
      processed.sort((a, b) => b.totalPower - a.totalPower);
      result[cat] = processed;
    });

    return result;
  }, [savedLevels, levelCap, gameMode]);

  // ---------------------------------------------------------
  // 4. GENERATION DES LINEUPS (LOGIQUE CŒUR)
  // ---------------------------------------------------------
  const lineups = useMemo(() => {
    if (!bestItems.Character?.length) return [];

    // On réduit le nombre d'items à tester pour la perf
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

    // Helper : Recalcule un item selon une limite (Cap) spécifique
    const recomputeItem = (item, capLimit) => {
      const realLevel = Math.min(item.level, capLimit);
      const newStats = computeStats(item.stats, realLevel);
      return {
        ...item,
        effectiveLevel: realLevel, // C'est ce niveau qui sera affiché
        calculatedStats: newStats, // Et ces stats utilisées pour l'addition
      };
    };

    // BOUCLE PRINCIPALE SUR LES PERSONNAGES
    chars.forEach((c) => {
      // --- LOGIQUE DU CAP DYNAMIQUE ---
      let currentCap = levelCap; // Valeur par défaut (Tournament / Grand Tour)

      if (gameMode === "regular") {
        // RÈGLE : Cap = Character Level + 2 (Max 15)
        // Si Character est lvl 8 => Cap = 10.
        currentCap = Math.min(15, c.level + 2);
      }

      // 1. On applique le cap au personnage lui-même
      const charItem = recomputeItem(c, currentCap);

      // 2. On recalcule TOUS les équipements en fonction de ce cap spécifique
      const currentRackets = rackets.map((i) => recomputeItem(i, currentCap));
      const currentGrips = grips.map((i) => recomputeItem(i, currentCap));
      const currentShoes = shoes.map((i) => recomputeItem(i, currentCap));
      const currentWrists = wrists.map((i) => recomputeItem(i, currentCap));
      const currentNutritions = nutritions.map((i) =>
        recomputeItem(i, currentCap),
      );
      const currentWorkouts = workouts.map((i) => recomputeItem(i, currentCap));

      // 3. Combinaisons
      currentRackets.forEach((r) => {
        currentGrips.forEach((g) => {
          currentShoes.forEach((s) => {
            currentWrists.forEach((w) => {
              currentNutritions.forEach((n) => {
                currentWorkouts.forEach((wk) => {
                  // Somme
                  const stats = {
                    ag:
                      charItem.calculatedStats.ag +
                      r.calculatedStats.ag +
                      g.calculatedStats.ag +
                      s.calculatedStats.ag +
                      w.calculatedStats.ag +
                      n.calculatedStats.ag +
                      wk.calculatedStats.ag,
                    st:
                      charItem.calculatedStats.st +
                      r.calculatedStats.st +
                      g.calculatedStats.st +
                      s.calculatedStats.st +
                      w.calculatedStats.st +
                      n.calculatedStats.st +
                      wk.calculatedStats.st,
                    se:
                      charItem.calculatedStats.se +
                      r.calculatedStats.se +
                      g.calculatedStats.se +
                      s.calculatedStats.se +
                      w.calculatedStats.se +
                      n.calculatedStats.se +
                      wk.calculatedStats.se,
                    vo:
                      charItem.calculatedStats.vo +
                      r.calculatedStats.vo +
                      g.calculatedStats.vo +
                      s.calculatedStats.vo +
                      w.calculatedStats.vo +
                      n.calculatedStats.vo +
                      wk.calculatedStats.vo,
                    fo:
                      charItem.calculatedStats.fo +
                      r.calculatedStats.fo +
                      g.calculatedStats.fo +
                      s.calculatedStats.fo +
                      w.calculatedStats.fo +
                      n.calculatedStats.fo +
                      wk.calculatedStats.fo,
                    ba:
                      charItem.calculatedStats.ba +
                      r.calculatedStats.ba +
                      g.calculatedStats.ba +
                      s.calculatedStats.ba +
                      w.calculatedStats.ba +
                      n.calculatedStats.ba +
                      wk.calculatedStats.ba,
                  };

                  // Filtre Min Stats
                  if (
                    stats.ag >= minAg &&
                    stats.st >= minSt &&
                    stats.se >= minSe &&
                    stats.vo >= minVo &&
                    stats.fo >= minFo &&
                    stats.ba >= minBa
                  ) {
                    result.push({
                      items: { c: charItem, r, g, s, w, n, wk },
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

    // On limite à 200 résultats pour ne pas faire laguer l'affichage
    return result.slice(0, 200);
  }, [bestItems, minStats, gameMode, levelCap]);

  // ---------------------------------------------------------
  // RENDER (AFFICHAGE)
  // ---------------------------------------------------------

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
            <Text
              style={{
                fontStyle: "italic",
                color: "#007AFF",
                fontWeight: "bold",
              }}
            >
              Auto (Max = Character Level + 2)
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
        <Text style={styles.sectionTitle}>
          Possible Lineups ({lineups.length})
        </Text>

        {lineups.length === 0 ? (
          <Text
            style={{ textAlign: "center", color: "#999", marginVertical: 10 }}
          >
            No combination found matching these filters.
          </Text>
        ) : (
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
                  {/* Petit indicateur visuel du niveau effectif du perso */}
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    Char Lvl: {l.items.c.effectiveLevel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
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
                    {fullNames[key]} — {item.name}{" "}
                    <Text style={{ color: "#007AFF" }}>
                      (Lvl {item.effectiveLevel})
                    </Text>
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
  textWhite: {
    color: "white",
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

  itemName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    paddingVertical: 2,
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
    height: 90, // Un peu plus haut pour le texte extra
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
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
});
