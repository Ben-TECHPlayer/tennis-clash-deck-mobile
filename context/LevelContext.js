import React, { createContext, useEffect, useState } from "react";

export const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
  // La mémoire globale : { "chemin/NaturalEnergy": 7, "chemin/Raptor": 10 }
  //   const [savedLevels, setSavedLevels] = useState({});
  // 1. Initialisation depuis le LocalStorage
  const [savedLevels, setSavedLevels] = useState(() => {
    const saved = localStorage.getItem("tennisClashLevels");
    return saved ? JSON.parse(saved) : {};
  });

  // 2. Sauvegarde automatique à chaque changement
  useEffect(() => {
    localStorage.setItem("tennisClashLevels", JSON.stringify(savedLevels));
  }, [savedLevels]);

  // Sert uniquement à savoir sur quelle page on est (pour le CSS toggle par exemple)
  const [activeItemPath, setActiveItemPath] = useState(null);

  // NOUVELLE FONCTION PLUS ROBUSTE
  const updateLevel = (itemId, level) => {
    setSavedLevels((prev) => {
      const newLevels = { ...prev };
      if (level === null) {
        delete newLevels[itemId]; // On supprime si désélectionné
      } else {
        newLevels[itemId] = level; // On sauvegarde
      }
      return newLevels;
    });
  };

  // --- NOUVELLE FONCTION : RESET ALL ---
  const resetAllLevels = () => {
    // On remet l'état à un objet vide.
    // Grâce à ton useEffect ci-dessus, le localStorage sera
    // automatiquement mis à jour avec "{}" (vide) juste après.
    setSavedLevels({});
  };

  return (
    <LevelContext.Provider
      value={{
        savedLevels,
        updateLevel, // On utilise ça maintenant pour sauvegarder
        resetAllLevels,
        activeItemPath,
        setActiveItemPath,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};
