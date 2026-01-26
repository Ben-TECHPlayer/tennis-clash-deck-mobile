import React, { createContext, useState } from 'react';

export const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
    // La mémoire globale : { "chemin/NaturalEnergy": 7, "chemin/Raptor": 10 }
    const [savedLevels, setSavedLevels] = useState({}); 
    
    // Sert uniquement à savoir sur quelle page on est (pour le CSS toggle par exemple)
    const [activeItemPath, setActiveItemPath] = useState(null);

    // NOUVELLE FONCTION PLUS ROBUSTE
    const updateLevel = (itemId, level) => {
        setSavedLevels(prev => {
            const newLevels = { ...prev };
            if (level === null) {
                delete newLevels[itemId]; // On supprime si désélectionné
            } else {
                newLevels[itemId] = level; // On sauvegarde
            }
            return newLevels;
        });
    };

    return (
        <LevelContext.Provider value={{ 
            savedLevels, 
            updateLevel, // On utilise ça maintenant pour sauvegarder
            activeItemPath, 
            setActiveItemPath 
        }}>
            {children}
        </LevelContext.Provider>
    );
};