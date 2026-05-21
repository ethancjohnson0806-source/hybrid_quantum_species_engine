/**
 * Temple Engine - Exact API Contract (5 Endpoints per Spec)
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { executeTempleEnginePipeline, applyUserFeedbackCorrection } from "../templeEngine.executor";
import { QuerySession } from "../templeEngine.types";

// In-memory session storage (replace with database in production)
const sessions = new Map<number, QuerySession>();
let sessionIdCounter = 1;

/**
 * POST /api/temple-engine/session
 * Create a new query session and start processing
 */
const createSessionProcedure = publicProcedure
  .input(z.object({
    user_query: z.string().min(1),
    emotional_valence: z.number().min(-1).max(1).optional(),
    urgency: z.number().min(0).max(1).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      // Execute the full pipeline
      const session = await executeTempleEnginePipeline(input.user_query);

      // Assign ID and store
      session.id = sessionIdCounter++;
      sessions.set(session.id, session);

      return {
        session_id: session.id,
        status: session.status,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${(error as any).message}`);
    }
  });

/**
 * GET /api/temple-engine/session/{session_id}
 * Get full session state
 */
const getSessionProcedure = publicProcedure
  .input(z.object({
    session_id: z.number(),
  }))
  .query(({ input }) => {
    const session = sessions.get(input.session_id);
    if (!session) {
      throw new Error(`Session ${input.session_id} not found`);
    }

    return {
      id: session.id,
      user_query: session.user_query,
      created_at: session.created_at,
      status: session.status,
      chambers: session.chambers.map(c => ({
        name: c.name,
        input_text: c.input_text,
        output_text: c.output_text,
        metrics: c.metrics,
        entered_at: c.entered_at,
        exited_at: c.exited_at,
        recursion_depth: c.recursion_depth,
      })),
      witness_state: session.witness_state,
      corrections: session.corrections,
      final_answer: session.final_answer,
    };
  });

/**
 * GET /api/temple-engine/session/{session_id}/stream
 * SSE stream for real-time updates
 */
const streamSessionProcedure = publicProcedure
  .input(z.object({
    session_id: z.number(),
  }))
  .query(({ input }) => {
    const session = sessions.get(input.session_id);
    if (!session) {
      throw new Error(`Session ${input.session_id} not found`);
    }

    // Return events for SSE streaming
    const events = [];

    // Chamber events
    session.chambers.forEach((chamber, index) => {
      events.push({
        type: 'chamber_started',
        chamber_name: chamber.name,
        timestamp: chamber.entered_at,
      });

      events.push({
        type: 'chamber_completed',
        chamber_name: chamber.name,
        output: chamber.output_text,
        metrics: chamber.metrics,
        timestamp: chamber.exited_at,
      });
    });

    // Witness events
    events.push({
      type: 'witness_updated',
      witness_state: session.witness_state,
      timestamp: new Date(),
    });

    // Correction events
    session.corrections.forEach(correction => {
      events.push({
        type: 'correction_triggered',
        correction,
        timestamp: correction.timestamp,
      });
    });

    // Session completion
    events.push({
      type: 'session_completed',
      final_answer: session.final_answer,
      timestamp: new Date(),
    });

    return { events };
  });

/**
 * POST /api/temple-engine/session/{session_id}/feedback
 * Submit user correction feedback
 */
const submitFeedbackProcedure = publicProcedure
  .input(z.object({
    session_id: z.number(),
    feedback: z.string().min(1),
    severity: z.enum(['minor', 'moderate', 'major']),
  }))
  .mutation(async ({ input }) => {
    const session = sessions.get(input.session_id);
    if (!session) {
      throw new Error(`Session ${input.session_id} not found`);
    }

    try {
      // Apply correction
      const updatedSession = await applyUserFeedbackCorrection(
        session,
        input.feedback,
        input.severity
      );

      // Update stored session
      sessions.set(input.session_id, updatedSession);

      return {
        status: 'corrected',
        jump_to_chamber: updatedSession.chambers[updatedSession.chambers.length - 1].name,
        final_answer: updatedSession.final_answer,
      };
    } catch (error) {
      console.error('Error applying feedback:', error);
      throw new Error(`Failed to apply feedback: ${(error as any).message}`);
    }
  });

/**
 * GET /api/temple-engine/session/{session_id}/corrections
 * Get correction journal
 */
const getCorrectionJournalProcedure = publicProcedure
  .input(z.object({
    session_id: z.number(),
    chamber_name: z.string().optional(),
    reason: z.string().optional(),
  }))
  .query(({ input }) => {
    const session = sessions.get(input.session_id);
    if (!session) {
      throw new Error(`Session ${input.session_id} not found`);
    }

    let corrections = session.corrections;

    // Filter by chamber if specified
    if (input.chamber_name) {
      corrections = corrections.filter(c => c.chamber_name === input.chamber_name);
    }

    // Filter by reason if specified
    if (input.reason) {
      corrections = corrections.filter(c => c.reason.includes(input.reason));
    }

    // Meta-analysis
    const correctionsByReason = new Map<string, number>();
    const correctionsByChamber = new Map<string, number>();

    corrections.forEach(c => {
      correctionsByReason.set(c.reason, (correctionsByReason.get(c.reason) || 0) + 1);
      correctionsByChamber.set(c.chamber_name, (correctionsByChamber.get(c.chamber_name) || 0) + 1);
    });

    return {
      corrections,
      meta_analysis: {
        total_corrections: corrections.length,
        most_common_reasons: Array.from(correctionsByReason.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        chambers_with_most_corrections: Array.from(correctionsByChamber.entries())
          .sort((a, b) => b[1] - a[1]),
      },
    };
  });

export const templeEngineRouter = router({
  createSession: createSessionProcedure,
  getSession: getSessionProcedure,
  streamSession: streamSessionProcedure,
  submitFeedback: submitFeedbackProcedure,
  getCorrectionJournal: getCorrectionJournalProcedure,
});
