import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";

type CompactContextType = {
  isCompact: boolean;
  setIsCompact: (value: boolean) => void;
  toggleCompact: () => void;
};

const CompactContext = createContext<CompactContextType | undefined>(undefined);

export function CompactProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    const stored = localStorage.getItem("isCompact");
    if (stored) {
      try {
        console.log("Retrieved isCompact from localStorage:", stored);
        return JSON.parse(stored);
      } catch (e) {
        return true; // error fallback
      }
    }
    return true; // default value
  });

  // Save to storage whenever isCompact changes
  useEffect(() => {
    localStorage.setItem("isCompact", JSON.stringify(isCompact));
  }, [isCompact]);

  // Toggle function for convenience
  const toggleCompact = useCallback(() => {
    setIsCompact((prev) => !prev);
  }, []);

  const value = {
    isCompact,
    setIsCompact,
    toggleCompact
  };

  return (
    <CompactContext.Provider value={value}>
      {children}
    </CompactContext.Provider>
  );
}

export function useCompact() {
  const context = useContext(CompactContext);
  if (context === undefined) {
    throw new Error("useCompact must be used within a CompactProvider");
  }
  return context;
}