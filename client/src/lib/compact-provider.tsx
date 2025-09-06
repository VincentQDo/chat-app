// hooks/use-compact-context.tsx
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

type CompactContextType = {
  isCompact: boolean;
  setIsCompact: (value: boolean) => void;
  toggleCompact: () => void;
};

const CompactContext = createContext<CompactContextType | undefined>(undefined);

export function CompactProvider({
  children,
  initialValue = false
}: {
  children: ReactNode;
  initialValue?: boolean;
}) {
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    const stored = localStorage.getItem('isCompact');
    console.log('Retrieved isCompact from localStorage:', stored);
    return stored ? JSON.parse(stored) : initialValue;
  });

  // Save to storage whenever isCompact changes
  useEffect(() => {
    localStorage.setItem('isCompact', JSON.stringify(isCompact));
  }, [isCompact]);

  // Save to storage on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('isCompact', JSON.stringify(isCompact));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    console.log('CompactProvider initialized, isCompact:', isCompact);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
    throw new Error('useCompact must be used within a CompactProvider');
  }
  return context;
}