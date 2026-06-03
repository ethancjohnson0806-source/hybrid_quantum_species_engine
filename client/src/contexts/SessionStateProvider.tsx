import React, { createContext, useContext, useState } from 'react';

export interface ChamberState {
  name: string;
  input_text: string;
  output_text: string;
  metrics: any;
  entered_at: string;
  exited_at?: string;
}

export interface QuerySession {
  id?: number;
  user_query: string;
  created_at: string;
  status: 'in_progress' | 'completed' | 'error';
  chambers: ChamberState[];
  witness_state: any;
  corrections: any[];
  final_answer: string | null;
}

interface SessionContextType {
  session: QuerySession | null;
  setSession: (session: QuerySession) => void;
}

const SessionStateContext = createContext<SessionContextType | undefined>(undefined);

export function SessionStateProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<QuerySession | null>(null);

  return (
    <SessionStateContext.Provider value={{ session, setSession }}>
      {children}
    </SessionStateContext.Provider>
  );
}

export function useSessionState() {
  const context = useContext(SessionStateContext);
  if (!context) {
    throw new Error('useSessionState must be used within SessionStateProvider');
  }
  return context;
}
