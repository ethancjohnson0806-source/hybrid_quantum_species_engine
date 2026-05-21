import React, { createContext, useContext, useState } from 'react';

export interface WitnessState {
  overall_coherence: number;
  overall_drift: number;
  overall_symbolic_density: number;
  alignment_score: number;
  active_chamber: string;
  recursion_depth: number;
  total_corrections: number;
}

interface WitnessContextType {
  witnessState: WitnessState | null;
  setWitnessState: (state: WitnessState) => void;
}

const WitnessStateContext = createContext<WitnessContextType | undefined>(undefined);

export function WitnessStateProvider({ children }: { children: React.ReactNode }) {
  const [witnessState, setWitnessState] = useState<WitnessState | null>(null);

  return (
    <WitnessStateContext.Provider value={{ witnessState, setWitnessState }}>
      {children}
    </WitnessStateContext.Provider>
  );
}

export function useWitnessState() {
  const context = useContext(WitnessStateContext);
  if (!context) {
    throw new Error('useWitnessState must be used within WitnessStateProvider');
  }
  return context;
}
