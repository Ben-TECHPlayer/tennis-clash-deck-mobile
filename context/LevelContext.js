import React, { createContext, useEffect, useState } from "react";
// 1. On importe AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
  // On initialise avec un objet vide
  const [savedLevels, setSavedLevels] = useState({});
  // On ajoute un état pour savoir si le chargement est terminé
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeItemPath, setActiveItemPath] = useState(null);

  // 2. CHARGEMENT (Load) - Se lance une seule fois au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem("tennisClashLevels");
        if (saved) {
          setSavedLevels(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load levels", error);
      } finally {
        // Qu'on ait trouvé des données ou pas, on dit que le chargement est fini
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // 3. SAUVEGARDE (Save) - Se lance à chaque changement de savedLevels
  useEffect(() => {
    const saveData = async () => {
      // CRUCIAL : On ne sauvegarde QUE si le chargement initial est terminé.
      // Sinon, on risque d'écraser les données stockées avec l'objet vide {} du début.
      if (isLoaded) {
        try {
          await AsyncStorage.setItem(
            "tennisClashLevels",
            JSON.stringify(savedLevels),
          );
        } catch (error) {
          console.error("Failed to save levels", error);
        }
      }
    };

    saveData();
  }, [savedLevels, isLoaded]);

  const updateLevel = (itemId, level) => {
    setSavedLevels((prev) => {
      const newLevels = { ...prev };
      if (level === null) {
        delete newLevels[itemId];
      } else {
        newLevels[itemId] = level;
      }
      return newLevels;
    });
  };

  const resetAllLevels = () => {
    setSavedLevels({});
    // Le useEffect de sauvegarde s'occupera de mettre à jour le AsyncStorage
  };

  return (
    <LevelContext.Provider
      value={{
        savedLevels,
        updateLevel,
        resetAllLevels,
        activeItemPath,
        setActiveItemPath,
      }}
    >
      {/* On peut afficher un petit chargement si besoin, ou juste children */}
      {children}
    </LevelContext.Provider>
  );
};
