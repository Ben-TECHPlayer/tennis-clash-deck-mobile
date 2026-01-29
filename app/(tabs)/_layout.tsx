import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, TouchableOpacity } from "react-native";
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
              {/* <Image> */}
              <Image
                source={require("../../assets/images/tennis-clash.png")}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          </Link>
        ),

        // --- BARRE DE NAVIGATION (BAS) ---
        tabBarStyle: {
          position: Platform.OS === "ios" ? "absolute" : "relative",
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",

          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarLabelStyle: {
          fontWeight: "bold",
          fontSize: 10,
          marginBottom: 5,
        },
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. CARDS (Icône de cartes superposées) */}
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="clone" size={24} color={color} />
          ),
        }}
      />

      {/* 3. LINEUP (Icône de groupe/équipe) */}
      <Tabs.Screen
        name="lineup"
        options={{
          title: "Lineup",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="users" size={24} color={color} />
          ),
        }}
      />

      {/* 4. CLUBS (Icône de bouclier/badge) */}
      <Tabs.Screen
        name="clubs"
        options={{
          title: "Clubs",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="shield" size={24} color={color} />
          ),
        }}
      />

      {/* 5. GAMES (Icône de trophée ou manette) */}
      <Tabs.Screen
        name="games"
        options={{
          title: "Games",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="trophy" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 20,
    justifyContent: "center",
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
});
