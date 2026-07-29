// src/user/Detectioncontext.js
import { createContext, useContext, useState } from "react";

const DetectionContext = createContext(null);

// Fonction utilitaire simple pour générer un ID unique court
const generateUid = () => Math.random().toString(36).substr(2, 9);

export function DetectionProvider({ children }) {
  const [detectionResult, setDetectionResultState] = useState(null);

  const setDetectionResult = (result) => {
    // On mappe les produits en ajoutant un 'uid' unique à CHAQUE ligne
    const productsWithUniqueIds = (result.known_products ?? []).map((p) => ({
      ...p,
      uid: generateUid(), // <--- AJOUT CRUCIAL : Identifiant unique par occurrence
      quantite: 1,
    }));
    
    setDetectionResultState({
      raw: result,
      known_products: productsWithUniqueIds
    });
  };

  const clearDetectionResult = () => {
    setDetectionResultState(null);
  };

  return (
    <DetectionContext.Provider value={{ 
      detectionResult,       
      setDetectionResult,    
      clearDetectionResult   
    }}>
      {children}
    </DetectionContext.Provider>
  );
}

export function useDetection() {
  const ctx = useContext(DetectionContext);
  if (!ctx) throw new Error("useDetection must be used inside <DetectionProvider>");
  return ctx;
}