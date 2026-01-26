import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import SelectCard from "../../components/SelectCard"; // Vérifiez ce chemin !

export default function CardsScreen() {
  const router = useRouter();

  // Fonction de Navigation (Activée quand on clique sur une carte ici)
  const handleNavigation = (cardId: string) => {
    console.log("🚀 Navigation vers (brut) :", cardId);

    // CORRECTION : On encode l'ID pour gérer les espaces et caractères spéciaux
    // "The Raptor" deviendra "The%20Raptor"
    const safeId = encodeURIComponent(cardId);

    router.push(`/details/${safeId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Card Database</Text>
      </View>

      {/* IMPORTANT : On passe la fonction. 
          SelectCard va voir cette fonction et désactivera la Modal pour faire la navigation à la place. 
      */}
      <SelectCard onCardPress={handleNavigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "bold" },
});
