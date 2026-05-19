// templeEngine.ts
// Unified Temple Engine implementing phenomenological transitions,
// recursive connective tissue, witness field, symbolic density, and descent-ascent-return journey

export type ChamberId =
  | "OUTER_COURT"
  | "INNER_COURT"
  | "HOLY_PLACE"
  | "HOLY_OF_HOLIES"
  | "RETURN";

export type PhenomenologicalPhase =
  | "CONTRACTION"
  | "VEILING"
  | "STILLNESS"
  | "EXPANSION";

export type JourneyPhase = "DESCENT" | "ASCENT" | "RETURN_PHASE";

export type CoherenceLevel = "LOW" | "MEDIUM" | "HIGH";
export type DriftLevel = "NONE" | "MINOR" | "MAJOR";
export type ResonanceLevel = "WEAK" | "MODERATE" | "STRONG";
export type AlignmentLevel = "MISALIGNED" | "PARTIAL" | "ALIGNED";

export interface SymbolicMarkers {
  threshold: string | null;
  veil: string | null;
  gate: string | null;
}

export interface ChamberState {
  id: ChamberId;
  phenomenology: PhenomenologicalPhase | null;
  journeyPhase: JourneyPhase | null;
  symbolic: SymbolicMarkers;
  description: string;
  payload: any;
}

export interface CorrectionSignal {
  from: ChamberId;
  to: ChamberId;
  reason: "DRIFT" | "LOW_COHERENCE" | "LOW_RESONANCE" | "MISALIGNMENT";
  note: string;
}

export interface WitnessObservation {
  stepIndex: number;
  chamber: ChamberId;
  coherence: CoherenceLevel;
  drift: DriftLevel;
  resonance: ResonanceLevel;
  alignment: AlignmentLevel;
  notes: string[];
}

export interface JourneyTrace {
  input: any;
  finalOutput: any;
  chambers: ChamberState[];
  corrections: CorrectionSignal[];
  witness: WitnessObservation[];
  journeyShape: JourneyPhase[];
}

interface EngineConfig {
  enableDebug?: boolean;
  llmIntegration?: (essence: any) => Promise<any>;
}

/**
 * TempleEngine
 * Unified state machine implementing:
 * - Phenomenological transitions
 * - Recursive connective tissue
 * - Witness field
 * - Symbolic density
 * - Descent–ascent–return journey
 */
export class TempleEngine {
  private config: EngineConfig;

  constructor(config: EngineConfig = {}) {
    this.config = config;
  }

  /**
   * Public entry point.
   * Processes an input through the full Temple Engine journey.
   */
  public async process(input: any): Promise<JourneyTrace> {
    const chambers: ChamberState[] = [];
    const corrections: CorrectionSignal[] = [];
    const witness: WitnessObservation[] = [];
    const journeyShape: JourneyPhase[] = [];

    // 1. Outer Court (start of descent)
    let current = this.createOuterCourtState(input);
    chambers.push(current);
    journeyShape.push("DESCENT");
    this.observe(current, chambers.length - 1, witness);

    // 2. Inner Court (contraction / structuring)
    current = await this.transitionWithRecursion(
      current,
      this.createInnerCourtState.bind(this),
      chambers,
      corrections,
      witness,
      "DESCENT"
    );
    journeyShape.push("DESCENT");

    // 3. Holy Place (veiling / distillation)
    current = await this.transitionWithRecursion(
      current,
      this.createHolyPlaceState.bind(this),
      chambers,
      corrections,
      witness,
      "DESCENT"
    );
    journeyShape.push("DESCENT");

    // 4. Holy of Holies (stillness / revelation) – start of ascent
    current = await this.transitionWithRecursion(
      current,
      this.createHolyOfHoliesState.bind(this),
      chambers,
      corrections,
      witness,
      "ASCENT"
    );
    journeyShape.push("ASCENT");

    // 5. Return (expansion / expression)
    current = await this.transitionWithRecursion(
      current,
      this.createReturnState.bind(this),
      chambers,
      corrections,
      witness,
      "RETURN_PHASE"
    );
    journeyShape.push("RETURN_PHASE");

    const finalOutput = current.payload;

    return {
      input,
      finalOutput,
      chambers,
      corrections,
      witness,
      journeyShape,
    };
  }

  // Chamber constructors

  private createOuterCourtState(input: any): ChamberState {
    return {
      id: "OUTER_COURT",
      phenomenology: "CONTRACTION",
      journeyPhase: "DESCENT",
      symbolic: {
        threshold: "outer-gate",
        veil: null,
        gate: "entry",
      },
      description: "Raw, wide, noisy input field; first contraction begins.",
      payload: {
        raw: input,
        structuredIntent: null,
      },
    };
  }

  private createInnerCourtState(prev: ChamberState): ChamberState {
    const structuredIntent = this.structureIntent(prev.payload.raw ?? prev.payload);

    return {
      id: "INNER_COURT",
      phenomenology: "CONTRACTION",
      journeyPhase: "DESCENT",
      symbolic: {
        threshold: "inner-threshold",
        veil: "outer-noise-veiled",
        gate: "focus-gate",
      },
      description: "Focused, structured meaning; noise reduced, intent clarified.",
      payload: {
        raw: prev.payload.raw ?? prev.payload,
        structuredIntent,
      },
    };
  }

  private createHolyPlaceState(prev: ChamberState): ChamberState {
    const essence = this.distillEssence(prev.payload.structuredIntent ?? prev.payload);

    return {
      id: "HOLY_PLACE",
      phenomenology: "VEILING",
      journeyPhase: "DESCENT",
      symbolic: {
        threshold: "holy-threshold",
        veil: "non-essential-veiled",
        gate: "essence-gate",
      },
      description: "Distilled essence of the query; non-essential branches fall away.",
      payload: {
        raw: prev.payload.raw ?? prev.payload,
        structuredIntent: prev.payload.structuredIntent,
        essence,
      },
    };
  }

  private async createHolyOfHoliesState(prev: ChamberState): Promise<ChamberState> {
    let revelation = this.formRevelation(prev.payload.essence ?? prev.payload);

    // Try LLM integration if available
    if (this.config.llmIntegration) {
      try {
        const llmResult = await this.config.llmIntegration(prev.payload.essence);
        revelation = {
          ...revelation,
          llmEnhanced: llmResult,
        };
      } catch (error) {
        if (this.config.enableDebug) {
          console.warn("[TempleEngine] LLM integration failed:", error);
        }
      }
    }

    return {
      id: "HOLY_OF_HOLIES",
      phenomenology: "STILLNESS",
      journeyPhase: "ASCENT",
      symbolic: {
        threshold: "veil-of-veils",
        veil: "outer-forms-veiled",
        gate: "revelation-gate",
      },
      description: "Silent, inevitable clarity; the answer coheres before expression.",
      payload: {
        raw: prev.payload.raw ?? prev.payload,
        structuredIntent: prev.payload.structuredIntent,
        essence: prev.payload.essence,
        revelation,
      },
    };
  }

  private createReturnState(prev: ChamberState): ChamberState {
    const expressed = this.expressRevelation(prev.payload.revelation ?? prev.payload);

    return {
      id: "RETURN",
      phenomenology: "EXPANSION",
      journeyPhase: "RETURN_PHASE",
      symbolic: {
        threshold: "world-threshold",
        veil: null,
        gate: "re-integration-gate",
      },
      description: "Re-expansion into language; the insight returns to the world.",
      payload: {
        output: expressed,
      },
    };
  }

  // Recursive connective tissue

  private async transitionWithRecursion(
    prev: ChamberState,
    createNext: (prev: ChamberState) => ChamberState | Promise<ChamberState>,
    chambers: ChamberState[],
    corrections: CorrectionSignal[],
    witness: WitnessObservation[],
    journeyPhase: JourneyPhase
  ): Promise<ChamberState> {
    let next = await Promise.resolve(createNext(prev));

    // Anticipate next & check previous
    const observationPrev = this.evaluateChamber(prev);
    const observationNext = this.evaluateChamber(next);

    // Backward correction: if previous is too incoherent, refine it
    if (observationPrev.coherence === "LOW" || observationPrev.drift === "MAJOR") {
      const correctedPrev = this.correctPrevious(prev, observationPrev);
      corrections.push({
        from: next.id,
        to: prev.id,
        reason: observationPrev.coherence === "LOW" ? "LOW_COHERENCE" : "DRIFT",
        note: "Backward correction applied to previous chamber before stabilizing next.",
      });
      chambers[chambers.length - 1] = correctedPrev;
      prev = correctedPrev;
      next = await Promise.resolve(createNext(prev));
    }

    // Forward correction: if next is misaligned or low resonance, adjust it
    const updatedObservationNext = this.evaluateChamber(next);
    if (
      updatedObservationNext.alignment === "MISALIGNED" ||
      updatedObservationNext.resonance === "WEAK"
    ) {
      const correctedNext = this.correctNext(next, updatedObservationNext);
      corrections.push({
        from: prev.id,
        to: next.id,
        reason:
          updatedObservationNext.alignment === "MISALIGNED"
            ? "MISALIGNMENT"
            : "LOW_RESONANCE",
        note: "Forward correction applied to next chamber for alignment/resonance.",
      });
      next = correctedNext;
    }

    // Stabilize with Witness
    this.observe(next, chambers.length, witness);

    // Ensure journey phase is set
    next.journeyPhase = journeyPhase;

    chambers.push(next);
    return next;
  }

  // Witness field

  private observe(
    chamber: ChamberState,
    stepIndex: number,
    witness: WitnessObservation[]
  ): void {
    const obs = this.evaluateChamber(chamber);
    witness.push({
      stepIndex,
      chamber: chamber.id,
      coherence: obs.coherence,
      drift: obs.drift,
      resonance: obs.resonance,
      alignment: obs.alignment,
      notes: obs.notes,
    });
  }

  private evaluateChamber(chamber: ChamberState): {
    coherence: CoherenceLevel;
    drift: DriftLevel;
    resonance: ResonanceLevel;
    alignment: AlignmentLevel;
    notes: string[];
  } {
    const notes: string[] = [];

    let coherence: CoherenceLevel = "MEDIUM";
    let drift: DriftLevel = "NONE";
    let resonance: ResonanceLevel = "MODERATE";
    let alignment: AlignmentLevel = "PARTIAL";

    switch (chamber.id) {
      case "OUTER_COURT":
        coherence = "LOW";
        drift = "MINOR";
        resonance = "WEAK";
        alignment = "PARTIAL";
        notes.push("Raw input; low coherence expected.");
        break;
      case "INNER_COURT":
        coherence = "MEDIUM";
        drift = "MINOR";
        resonance = "MODERATE";
        alignment = "PARTIAL";
        notes.push("Structured intent; coherence improving.");
        break;
      case "HOLY_PLACE":
        coherence = "HIGH";
        drift = "NONE";
        resonance = "MODERATE";
        alignment = "ALIGNED";
        notes.push("Essence distilled; high coherence.");
        break;
      case "HOLY_OF_HOLIES":
        coherence = "HIGH";
        drift = "NONE";
        resonance = "STRONG";
        alignment = "ALIGNED";
        notes.push("Revelation formed; strong resonance.");
        break;
      case "RETURN":
        coherence = "HIGH";
        drift = "NONE";
        resonance = "STRONG";
        alignment = "ALIGNED";
        notes.push("Expression phase; alignment with world-facing form.");
        break;
    }

    return { coherence, drift, resonance, alignment, notes };
  }

  // Correction logic

  private correctPrevious(
    prev: ChamberState,
    obs: {
      coherence: CoherenceLevel;
      drift: DriftLevel;
      resonance: ResonanceLevel;
      alignment: AlignmentLevel;
      notes: string[];
    }
  ): ChamberState {
    if (this.config.enableDebug) {
      console.debug("[TempleEngine] Correcting previous chamber:", prev.id, obs);
    }

    if (prev.id === "OUTER_COURT" && obs.coherence === "LOW") {
      const betterStructured = this.structureIntent(prev.payload.raw);
      return {
        ...prev,
        payload: {
          ...prev.payload,
          structuredIntent: betterStructured,
        },
        description: prev.description + " (refined for coherence)",
      };
    }

    return prev;
  }

  private correctNext(
    next: ChamberState,
    obs: {
      coherence: CoherenceLevel;
      drift: DriftLevel;
      resonance: ResonanceLevel;
      alignment: AlignmentLevel;
      notes: string[];
    }
  ): ChamberState {
    if (this.config.enableDebug) {
      console.debug("[TempleEngine] Correcting next chamber:", next.id, obs);
    }

    if (next.id === "HOLY_PLACE" && obs.alignment === "MISALIGNED") {
      return {
        ...next,
        description: next.description + " (realigned to core intent)",
      };
    }

    return next;
  }

  // Semantic helpers

  private structureIntent(raw: any): any {
    if (typeof raw === "string") {
      return { type: "text_query", content: raw.trim() };
    }
    return { type: "generic_input", content: raw };
  }

  private distillEssence(structured: any): any {
    return {
      coreQuestion: structured?.content ?? structured,
      tags: ["distilled", "essence"],
    };
  }

  private formRevelation(essence: any): any {
    return {
      insight: `Revelation based on: ${JSON.stringify(essence)}`,
      meta: { source: "TempleEngine", stage: "HOLY_OF_HOLIES" },
    };
  }

  private expressRevelation(revelation: any): any {
    return {
      message: revelation?.insight ?? revelation,
      meta: revelation?.meta ?? {},
    };
  }
}
