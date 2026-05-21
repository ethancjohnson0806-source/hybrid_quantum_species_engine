/**
 * Temple Engine - Pipeline Executor with Recursion (Exact per Spec)
 */

import {
  ChamberState,
  QuerySession,
  CorrectionEvent,
  WitnessState,
  ChamberName,
  CHAMBER_ORDER,
  MAX_RECURSION_DEPTH,
} from "./templeEngine.types";

import {
  processSurfaceChamber,
  processDescentChamber,
  processCompressionChamber,
  processExpansionChamber,
  processReturnChamber,
} from "./templeEngine.chambers";

import {
  computeWitnessState,
  shouldTriggerCorrection,
  getJumpBackChamber,
  createCorrectionEvent,
} from "./templeEngine.witness";

/**
 * Execute the full Temple Engine pipeline with recursion (exact per spec)
 */
export async function executeTempleEnginePipeline(userQuery: string): Promise<QuerySession> {
  const session: QuerySession = {
    id: 0, // Will be set by database
    user_query: userQuery,
    created_at: new Date(),
    chambers: [],
    witness_state: {
      overall_coherence: 0,
      overall_drift: 0,
      overall_symbolic_density: 0,
      alignment_score: 0,
      active_chamber: 'Surface',
      recursion_depth: 0,
      total_corrections: 0,
    },
    corrections: [],
    final_answer: '',
    status: 'in_progress',
  };

  let recursionDepth = 0;
  let currentChamberIndex = 0;

  try {
    while (currentChamberIndex < CHAMBER_ORDER.length && recursionDepth < MAX_RECURSION_DEPTH) {
      const chamberName = CHAMBER_ORDER[currentChamberIndex];
      const previousOutput = session.chambers.length > 0
        ? session.chambers[session.chambers.length - 1].output_text
        : userQuery;

      // Execute the chamber
      let chamber: ChamberState;
      switch (chamberName) {
        case 'Surface':
          chamber = await processSurfaceChamber(userQuery);
          break;
        case 'Descent':
          chamber = await processDescentChamber(userQuery, previousOutput);
          break;
        case 'Compression':
          chamber = await processCompressionChamber(userQuery, previousOutput);
          break;
        case 'Expansion':
          chamber = await processExpansionChamber(userQuery, previousOutput);
          break;
        case 'Return':
          chamber = await processReturnChamber(userQuery, previousOutput);
          break;
        default:
          throw new Error(`Unknown chamber: ${chamberName}`);
      }

      // Set recursion tracking
      chamber.recursion_depth = recursionDepth;
      chamber.metrics.recursion_depth = recursionDepth;

      // Add to session
      session.chambers.push(chamber);

      // Check if correction is needed (exact per spec)
      if (shouldTriggerCorrection(chamber) && recursionDepth < MAX_RECURSION_DEPTH) {
        const jumpBackChamber = getJumpBackChamber(
          'witness_flag',
          chamberName,
          chamber.metrics.coherence_score
        );

        const severity = chamber.metrics.coherence_score < 0.4 ? 'major' : 'moderate';

        const correction = createCorrectionEvent(
          session.id,
          chamberName,
          'witness_flag',
          chamber.output_text,
          chamber.output_text, // Will be updated on re-entry
          severity
        );

        session.corrections.push(correction);

        // Jump back to the appropriate chamber
        currentChamberIndex = CHAMBER_ORDER.indexOf(jumpBackChamber);
        recursionDepth++;

        // Continue to re-enter the chamber
        continue;
      }

      // Move to next chamber
      currentChamberIndex++;
    }

    // Compute final witness state
    session.witness_state = computeWitnessState(
      session.chambers,
      session.corrections,
      session.chambers.length > 0 ? session.chambers[session.chambers.length - 1].name : 'Return',
      recursionDepth
    );

    // Set final answer
    session.final_answer = session.chambers.length > 0
      ? session.chambers[session.chambers.length - 1].output_text
      : userQuery;

    session.status = 'completed';
  } catch (error) {
    console.error('Pipeline error:', error);
    session.status = 'error';
    session.final_answer = `Error: ${(error as any).message}`;
  }

  return session;
}

/**
 * Apply user feedback correction (exact per spec)
 * User can submit feedback to trigger a correction
 */
export async function applyUserFeedbackCorrection(
  session: QuerySession,
  feedback: string,
  severity: 'minor' | 'moderate' | 'major'
): Promise<QuerySession> {
  if (session.chambers.length === 0) {
    return session;
  }

  const lastChamber = session.chambers[session.chambers.length - 1];

  // Determine which chamber to jump back to
  const jumpBackChamber = getJumpBackChamber(feedback, lastChamber.name, lastChamber.metrics.coherence_score);

  // Create correction event
  const correction = createCorrectionEvent(
    session.id,
    lastChamber.name,
    `user_feedback: ${feedback}`,
    lastChamber.output_text,
    lastChamber.output_text, // Will be updated
    severity
  );

  session.corrections.push(correction);

  // Re-run from the jump-back chamber
  const jumpBackIndex = CHAMBER_ORDER.indexOf(jumpBackChamber);
  const previousOutput = jumpBackIndex > 0 && session.chambers.length > jumpBackIndex - 1
    ? session.chambers[jumpBackIndex - 1].output_text
    : session.user_query;

  // Execute the chamber with correction context
  let correctedChamber: ChamberState;
  switch (jumpBackChamber) {
    case 'Surface':
      correctedChamber = await processSurfaceChamber(session.user_query);
      break;
    case 'Descent':
      correctedChamber = await processDescentChamber(session.user_query, previousOutput);
      break;
    case 'Compression':
      correctedChamber = await processCompressionChamber(session.user_query, previousOutput);
      break;
    case 'Expansion':
      correctedChamber = await processExpansionChamber(session.user_query, previousOutput);
      break;
    case 'Return':
      correctedChamber = await processReturnChamber(session.user_query, previousOutput);
      break;
    default:
      throw new Error(`Unknown chamber: ${jumpBackChamber}`);
  }

  // Update correction with corrected output
  correction.corrected_output = correctedChamber.output_text;

  // Remove chambers from jump-back point onward and add corrected chamber
  session.chambers = session.chambers.slice(0, jumpBackIndex);
  session.chambers.push(correctedChamber);

  // Recompute witness state
  session.witness_state = computeWitnessState(
    session.chambers,
    session.corrections,
    correctedChamber.name,
    0
  );

  // Update final answer
  session.final_answer = correctedChamber.output_text;

  return session;
}
