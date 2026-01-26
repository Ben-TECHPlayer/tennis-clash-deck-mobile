import { Stack } from "expo-router";
import React from "react";
// Assurez-vous que le chemin vers votre contexte est bon !
// Si votre dossier context est à la racine du projet (hors de app), c'est "../context/..."
import { LevelProvider } from "../context/LevelContext";

export default function RootLayout() {
  return (
    // On enveloppe toute l'application avec votre contexte (les données)
    <LevelProvider>
      <Stack>
        {/* On charge les onglets (le dossier (tabs)) sans afficher d'en-tête */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </LevelProvider>
  );
}
