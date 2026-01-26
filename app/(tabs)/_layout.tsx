import { Link, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
// 1. On importe le hook pour gérer les zones de sécurité
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  // 2. On récupère les dimensions de sécurité (notamment le bas)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // --- HEADER (HAUT) ---
        headerShown: true,
        headerStyle: {
          backgroundColor: "#fff",
          // On peut aussi ajuster la hauteur du header si besoin
          height: Platform.OS === "ios" ? 100 : 80,
        },
        headerTitle: "",
        headerShadowVisible: false,
        headerLeft: () => (
          <Link href="/" asChild>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.benText}>Ben.</Text>
            </TouchableOpacity>
          </Link>
        ),

        // --- BARRE DE NAVIGATION (BAS) ---
        tabBarStyle: {
          position: Platform.OS === "ios" ? "absolute" : "relative",
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff", // Important pour cacher ce qu'il y a derrière

          // 3. LA CORRECTION EST ICI :
          // On ajoute l'espace de sécurité à la hauteur de base (60)
          height: 60 + insets.bottom,
          // On ajoute du "rembourrage" en bas pour remonter les icônes
          paddingBottom: insets.bottom,
          paddingTop: 10, // Un peu d'espace en haut des icônes
          elevation: 0, // Enlève l'ombre sur Android pour un look plus plat
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarLabelStyle: {
          fontWeight: "bold",
          fontSize: 10,
          marginBottom: 5, // Remonte un peu le texte si besoin
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="cards" options={{ title: "Cards" }} />
      <Tabs.Screen name="lineup" options={{ title: "Lineup" }} />
      <Tabs.Screen name="clubs" options={{ title: "Clubs" }} />
      <Tabs.Screen name="games" options={{ title: "Games" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 20,
    justifyContent: "center",
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  benText: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
    }),
    color: "#007AFF",
  },
});
