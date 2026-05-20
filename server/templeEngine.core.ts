/**
 * Temple Engine Core - Recursive, Correction-Aware Reasoning System
 * Implements the five-chamber pipeline: Surface → Descent → Compression → Expansion → Return
 */

export type ChamberName = "Surface" | "Descent" | "Compression" | "Expansion" | "Return";

export interface ChamberMetrics {
  coherenceScore: number; // 0-1
  driftScore: number; // 0-1
  symbolicDensity: number; // 0-1
  ambiguityScore: number; // 0-1
  correctionCount: number;
}

export interface ChamberState {
  name: ChamberName;
  inputText: string;
  outputText: string;
  llmTrace?: string;
  metrics: ChamberMetrics;
  recursionDepth: number;
  parentChamberName?: ChamberName;
  enteredAt: Date;
  exitedAt?: Date;
}

export interface WitnessState {
  overallCoherence: number;
  overallDrift: number;
  overallSymbolicDensity: number;
  alignmentScore: number;
  activeChamber: ChamberName;
  recursionDepth: number;
  totalCorrections: number;
}

export interface CorrectionEvent {
  chamberName: ChamberName;
  reason: "logical_inconsistency" | "user_feedback" | "witness_flag";
  severity: "minor" | "moderate" | "major";
  previousOutput: string;
  correctedOutput: string;
  deltaSummary: string;
  timestamp: Date;
}

export interface JourneyTrace {
  userQuery: string;
  chambers: ChamberState[];
  witnessState: WitnessState;
  corrections: CorrectionEvent[];
  finalAnswer: string;
  status: "completed" | "error";
}

/**
 * Compute metrics for a chamber's output
 */
export function computeChamberMetrics(
  input: string,
  output: string,
  previousMetrics?: ChamberMetrics
): ChamberMetrics {
  // Coherence: measure internal consistency (0-1)
  const coherenceScore = computeCoherence(output);

  // Drift: compare to original query (0-1)
  const driftScore = computeDrift(input, output);

  // Symbolic density: ratio of abstract terms (0-1)
  const symbolicDensity = computeSymbolicDensity(output);

  // Ambiguity: unresolved references (0-1)
  const ambiguityScore = computeAmbiguity(output);

  return {
    coherenceScore,
    driftScore,
    symbolicDensity,
    ambiguityScore,
    correctionCount: previousMetrics?.correctionCount || 0,
  };
}

/**
 * Check if a correction should be triggered
 */
export function shouldTriggerCorrection(metrics: ChamberMetrics): boolean {
  return (
    metrics.coherenceScore < 0.6 ||
    metrics.driftScore > 0.4 ||
    (1 - metrics.ambiguityScore) < 0.6
  );
}

/**
 * Compute overall witness state from all chambers
 */
export function computeWitnessState(
  chambers: ChamberState[],
  corrections: CorrectionEvent[],
  activeChamber: ChamberName,
  recursionDepth: number
): WitnessState {
  if (chambers.length === 0) {
    return {
      overallCoherence: 0.5,
      overallDrift: 0.5,
      overallSymbolicDensity: 0.5,
      alignmentScore: 0.5,
      activeChamber,
      recursionDepth,
      totalCorrections: corrections.length,
    };
  }

  const avgCoherence =
    chambers.reduce((sum, c) => sum + c.metrics.coherenceScore, 0) /
    chambers.length;
  const maxDrift = Math.max(
    ...chambers.map((c) => c.metrics.driftScore)
  );
  const avgSymbolicDensity =
    chambers.reduce((sum, c) => sum + c.metrics.symbolicDensity, 0) /
    chambers.length;

  const alignmentScore =
    (avgCoherence * 0.4 + (1 - maxDrift) * 0.3 + (1 - avgSymbolicDensity) * 0.3);

  return {
    overallCoherence: avgCoherence,
    overallDrift: maxDrift,
    overallSymbolicDensity: avgSymbolicDensity,
    alignmentScore: Math.max(0, Math.min(1, alignmentScore)),
    activeChamber,
    recursionDepth,
    totalCorrections: corrections.length,
  };
}

// Helper functions for metric computation

function computeCoherence(text: string): number {
  // Simple heuristic: check for contradictions, logical flow
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0.5;

  // Check for common contradiction patterns
  const contradictionPatterns = [
    /however|but|yet|nevertheless/i,
    /on the other hand/i,
  ];
  const contradictions = contradictionPatterns.filter((p) =>
    p.test(text)
  ).length;

  // Penalize for contradictions
  const coherence = Math.max(0, 1 - contradictions * 0.2);
  return Math.min(1, coherence);
}

function computeDrift(original: string, current: string): number {
  // Simple heuristic: check if key terms from original are preserved
  const originalTerms = original
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const currentTerms = current
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (originalTerms.length === 0) return 0;

  const preserved = originalTerms.filter((t) =>
    currentTerms.some((c) => c.includes(t) || t.includes(c))
  ).length;

  return 1 - preserved / originalTerms.length;
}

function computeSymbolicDensity(text: string): number {
  // Count abstract/symbolic terms vs concrete terms
  const abstractPatterns =
    /concept|idea|theory|principle|nature|essence|being|consciousness|reality/gi;
  const concretePatterns =
    /object|thing|person|place|action|event|physical|material/gi;

  const abstractCount = (text.match(abstractPatterns) || []).length;
  const concreteCount = (text.match(concretePatterns) || []).length;

  const total = abstractCount + concreteCount;
  if (total === 0) return 0.5;

  return abstractCount / total;
}

function computeAmbiguity(text: string): number {
  // Count vague phrases and unresolved references
  const vaguePatterns =
    /something|somehow|somewhere|some|various|several|many|few|etc/gi;
  const pronounsWithoutAntecedent = /\b(it|they|them|this|that)\b/gi;

  const vagueCount = (text.match(vaguePatterns) || []).length;
  const pronounCount = (text.match(pronounsWithoutAntecedent) || []).length;

  const words = text.split(/\s+/).length;
  return (vagueCount + pronounCount * 0.5) / (words / 10);
}

export const CHAMBER_ORDER: ChamberName[] = [
  "Surface",
  "Descent",
  "Compression",
  "Expansion",
  "Return",
];

export function getNextChamber(current: ChamberName): ChamberName | null {
  const index = CHAMBER_ORDER.indexOf(current);
  return index < CHAMBER_ORDER.length - 1 ? CHAMBER_ORDER[index + 1] : null;
}
