/**
 * Temple Engine - Exact Data Structures per Spec
 */

// Chamber names (exact per spec)
export type ChamberName = 'Surface' | 'Descent' | 'Compression' | 'Expansion' | 'Return';

export const CHAMBER_ORDER: ChamberName[] = ['Surface', 'Descent', 'Compression', 'Expansion', 'Return'];

// ChamberMetrics (exact per spec)
export interface ChamberMetrics {
  coherence_score: number; // 0-1
  drift_score: number; // 0-1
  symbolic_density: number; // 0-1
  ambiguity_score: number; // 0-1
  recursion_depth: number;
  correction_count: number;
}

// ChamberState (exact per spec)
export interface ChamberState {
  name: ChamberName;
  input_text: string;
  output_text: string;
  llm_trace?: string;
  metrics: ChamberMetrics;
  entered_at: Date | string;
  exited_at?: Date | string;
  recursion_depth?: number;
  parent_chamber_name?: ChamberName;
}

// WitnessState (exact per spec)
export interface WitnessState {
  overall_coherence: number; // 0-1
  overall_drift: number; // 0-1
  overall_symbolic_density: number; // 0-1
  alignment_score: number; // 0-1
  active_chamber: ChamberName;
  recursion_depth: number;
  total_corrections: number;
}

// CorrectionEvent (exact per spec)
export interface CorrectionEvent {
  id?: number;
  query_session_id: number;
  chamber_name: ChamberName;
  timestamp: Date;
  reason: string; // e.g., "logical_inconsistency", "user_feedback", "witness_flag"
  previous_output: string;
  corrected_output: string;
  delta_summary: string;
  severity: 'minor' | 'moderate' | 'major';
}

// QuerySession (exact per spec)
export interface QuerySession {
  id: number;
  user_query: string;
  created_at: Date;
  chambers: ChamberState[];
  witness_state: WitnessState;
  corrections: CorrectionEvent[];
  final_answer: string;
  status: 'in_progress' | 'completed' | 'error';
}

// Correction thresholds (exact per spec)
export const CORRECTION_THRESHOLDS = {
  coherence_min: 0.6,
  drift_max: 0.4,
  alignment_min: 0.6,
};

// Recursion limits
export const MAX_RECURSION_DEPTH = 3;
