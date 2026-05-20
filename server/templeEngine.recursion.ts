/**
 * Temple Engine Recursion - Real re-entry and correction logic
 */

import {
  ChamberName,
  ChamberState,
  CorrectionEvent,
  CHAMBER_ORDER,
  computeChamberMetrics,
  shouldTriggerCorrection,
} from "./templeEngine.core";

interface RecursionContext {
  correctionContext?: {
    reason: string;
    previousOutput: string;
    chamber: ChamberName;
  };
  jumpToChamber?: ChamberName;
}

/**
 * Decide where to jump back to based on correction reason
 */
export function decideJumpTarget(
  currentChamber: ChamberName,
  reason: "logical_inconsistency" | "user_feedback" | "witness_flag"
): ChamberName {
  if (reason === "user_feedback") {
    // User feedback usually means go back to the chamber that produced the bad output
    return currentChamber;
  }

  if (reason === "witness_flag") {
    // Witness flags usually indicate reasoning problems
    const chamberIndex = CHAMBER_ORDER.indexOf(currentChamber);
    
    if (currentChamber === "Return") {
      // If in Return, go back to Expansion
      return "Expansion";
    } else if (currentChamber === "Expansion") {
      // If in Expansion, go back to Compression
      return "Compression";
    } else if (currentChamber === "Compression") {
      // If in Compression, go back to Descent
      return "Descent";
    } else {
      // Otherwise stay in current chamber
      return currentChamber;
    }
  }

  return currentChamber;
}

/**
 * Apply correction context to a chamber re-entry
 */
export function applyCorrectionContext(
  originalInput: string,
  correctionContext: RecursionContext["correctionContext"]
): string {
  if (!correctionContext) return originalInput;

  return `${originalInput}\n\n[CORRECTION CONTEXT]\nPrevious attempt had issue: ${correctionContext.reason}\nPrevious output was: "${correctionContext.previousOutput}"\nPlease revise and address the issue.`;
}

/**
 * Check if we should re-enter a chamber
 */
export function shouldReenter(
  chamber: ChamberState,
  recursionDepth: number,
  maxRecursionDepth: number
): boolean {
  // Don't recurse too deep
  if (recursionDepth >= maxRecursionDepth) return false;

  // Re-enter if metrics are bad
  return shouldTriggerCorrection(chamber.metrics);
}

/**
 * Create a re-entry chamber state (modified version of original)
 */
export function createReentryChamberState(
  originalChamber: ChamberState,
  correctionContext: RecursionContext["correctionContext"],
  recursionDepth: number
): Partial<ChamberState> {
  return {
    name: originalChamber.name,
    inputText: applyCorrectionContext(
      originalChamber.inputText,
      correctionContext
    ),
    recursionDepth,
    parentChamberName: originalChamber.name,
    enteredAt: new Date(),
  };
}

/**
 * Determine correction severity based on metrics
 */
export function determineCorrectionSeverity(
  coherence: number,
  drift: number,
  ambiguity: number
): "minor" | "moderate" | "major" {
  const issues = [
    coherence < 0.6 ? 1 : 0,
    drift > 0.4 ? 1 : 0,
    ambiguity > 0.6 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (issues >= 2) return "major";
  if (issues === 1) return "moderate";
  return "minor";
}

/**
 * Generate delta summary for correction
 */
export function generateDeltaSummary(
  previousOutput: string,
  correctedOutput: string,
  reason: string
): string {
  const prevLength = previousOutput.length;
  const corrLength = correctedOutput.length;
  const lengthDelta = corrLength - prevLength;

  return `Corrected due to ${reason}. Length changed from ${prevLength} to ${corrLength} chars (${lengthDelta > 0 ? "+" : ""}${lengthDelta}). Coherence and clarity improved.`;
}

/**
 * Build a complete correction event
 */
export function buildCorrectionEvent(
  chamber: ChamberName,
  previousOutput: string,
  correctedOutput: string,
  reason: "logical_inconsistency" | "user_feedback" | "witness_flag",
  coherence: number,
  drift: number,
  ambiguity: number
): CorrectionEvent {
  return {
    chamberName: chamber,
    reason,
    severity: determineCorrectionSeverity(coherence, drift, ambiguity),
    previousOutput,
    correctedOutput,
    deltaSummary: generateDeltaSummary(previousOutput, correctedOutput, reason),
    timestamp: new Date(),
  };
}
