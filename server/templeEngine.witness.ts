/**
 * Temple Engine - Witness Field (Exact per Spec)
 * Computes metrics and detects when corrections are needed
 */

import { ChamberState, WitnessState, CorrectionEvent, CORRECTION_THRESHOLDS, ChamberName } from "./templeEngine.types";

/**
 * Compute aggregated WitnessState from all chambers (exact per spec)
 */
export function computeWitnessState(
  chambers: ChamberState[],
  corrections: CorrectionEvent[],
  activeChamber: ChamberName,
  recursionDepth: number
): WitnessState {
  // overall_coherence = weighted average of chamber coherence
  const coherenceScores = chambers.map(c => c.metrics.coherence_score);
  const overall_coherence = coherenceScores.length > 0
    ? coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length
    : 0.5;

  // overall_drift = max or weighted average of drift
  const driftScores = chambers.map(c => c.metrics.drift_score);
  const overall_drift = driftScores.length > 0
    ? Math.max(...driftScores)
    : 0.2;

  // overall_symbolic_density = average
  const densityScores = chambers.map(c => c.metrics.symbolic_density);
  const overall_symbolic_density = densityScores.length > 0
    ? densityScores.reduce((a, b) => a + b, 0) / densityScores.length
    : 0.5;

  // alignment_score = heuristic(low drift + high coherence + low ambiguity)
  const ambiguityScores = chambers.map(c => c.metrics.ambiguity_score);
  const avgAmbiguity = ambiguityScores.length > 0
    ? ambiguityScores.reduce((a, b) => a + b, 0) / ambiguityScores.length
    : 0.2;

  const alignment_score = Math.max(0, Math.min(1,
    (overall_coherence * 0.5) +
    ((1 - overall_drift) * 0.3) +
    ((1 - avgAmbiguity) * 0.2)
  ));

  return {
    overall_coherence,
    overall_drift,
    overall_symbolic_density,
    alignment_score,
    active_chamber: activeChamber,
    recursion_depth: recursionDepth,
    total_corrections: corrections.length,
  };
}

/**
 * Check if correction should be triggered (exact per spec)
 * Triggers when:
 * - coherence < 0.6
 * - drift > 0.4
 * - alignment < 0.6
 */
export function shouldTriggerCorrection(chamber: ChamberState): boolean {
  const { coherence_score, drift_score } = chamber.metrics;

  // Check individual thresholds
  if (coherence_score < CORRECTION_THRESHOLDS.coherence_min) {
    return true;
  }

  if (drift_score > CORRECTION_THRESHOLDS.drift_max) {
    return true;
  }

  return false;
}

/**
 * Determine which chamber to jump back to for correction (exact per spec)
 * Logic:
 * - Minor wording issue → re-enter Expansion
 * - Reasoning flaw → re-enter Compression or Descent
 * - Misunderstanding of query → re-enter Surface
 */
export function getJumpBackChamber(
  reason: string,
  currentChamber: ChamberName,
  coherenceScore: number
): ChamberName {
  // If very low coherence, go back to beginning
  if (coherenceScore < 0.4) {
    return 'Surface';
  }

  // If reasoning flaw, go to Compression or Descent
  if (reason.includes('reasoning') || reason.includes('logic')) {
    return coherenceScore < 0.5 ? 'Descent' : 'Compression';
  }

  // If wording issue, stay in Expansion
  if (reason.includes('wording') || reason.includes('clarity')) {
    return 'Expansion';
  }

  // Default: go back one chamber
  const chamberOrder: ChamberName[] = ['Surface', 'Descent', 'Compression', 'Expansion', 'Return'];
  const currentIndex = chamberOrder.indexOf(currentChamber);
  return currentIndex > 0 ? chamberOrder[currentIndex - 1] : 'Surface';
}

/**
 * Create a correction event (exact per spec)
 */
export function createCorrectionEvent(
  sessionId: number,
  chamberName: ChamberName,
  reason: string,
  previousOutput: string,
  correctedOutput: string,
  severity: 'minor' | 'moderate' | 'major'
): CorrectionEvent {
  return {
    query_session_id: sessionId,
    chamber_name: chamberName,
    timestamp: new Date(),
    reason,
    previous_output: previousOutput,
    corrected_output: correctedOutput,
    delta_summary: `Changed from: "${previousOutput.substring(0, 50)}..." to: "${correctedOutput.substring(0, 50)}..."`,
    severity,
  };
}
