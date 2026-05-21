import React, { createContext, useContext, useState } from 'react';

export interface CorrectionEvent {
  id: string;
  chamber_name: string;
  reason: string;
  severity: 'minor' | 'moderate' | 'major';
  previous_output: string;
  corrected_output: string;
  delta_summary: string;
  timestamp: string;
}

interface CorrectionContextType {
  corrections: CorrectionEvent[];
  addCorrection: (correction: CorrectionEvent) => void;
}

const CorrectionJournalContext = createContext<CorrectionContextType | undefined>(undefined);

export function CorrectionJournalProvider({ children }: { children: React.ReactNode }) {
  const [corrections, setCorrections] = useState<CorrectionEvent[]>([]);

  const addCorrection = (correction: CorrectionEvent) => {
    setCorrections(prev => [...prev, correction]);
  };

  return (
    <CorrectionJournalContext.Provider value={{ corrections, addCorrection }}>
      {children}
    </CorrectionJournalContext.Provider>
  );
}

export function useCorrectionJournal() {
  const context = useContext(CorrectionJournalContext);
  if (!context) {
    throw new Error('useCorrectionJournal must be used within CorrectionJournalProvider');
  }
  return context;
}
