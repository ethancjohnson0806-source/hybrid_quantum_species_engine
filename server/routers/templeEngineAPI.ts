/**
 * Temple Engine - Exact API Contract (5 Endpoints per Spec)
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { executeTempleEnginePipeline, applyUserFeedbackCorrection } from "../templeEngine.executor";
import { QuerySession } from "../templeEngine.types";
import { getDb } from "../db";
import { querySessions } from "../../drizzle/schema";
import { desc } from "drizzle-orm";

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
        chambers: session.chambers.map(c => ({
          name: c.name,
          input_text: c.input_text,
          output_text: c.output_text,
          metrics: c.metrics,
          entered_at: c.entered_at instanceof Date ? c.entered_at.toISOString() : c.entered_at,
          exited_at: c.exited_at instanceof Date ? c.exited_at.toISOString() : c.exited_at,
          recursion_depth: c.recursion_depth,
        })),
        witness_state: session.witness_state,
        corrections: session.corrections,
        final_answer: session.final_answer,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${(error as any).message}`);
    }
  });

/**
 * processQuery - Alias for createSession to match frontend expectations
 * This is the primary endpoint the frontend calls
 */
const processQueryProcedure = publicProcedure
  .input(z.object({
    user_query: z.string().min(1),
    emotional_valence: z.number().min(-1).max(1).optional(),
    urgency: z.number().min(0).max(1).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      // Execute the full pipeline
      const session = await executeTempleEnginePipeline(input.user_query);

      // Assign ID and store in memory
      session.id = sessionIdCounter++;
      sessions.set(session.id, session);

      // Also persist to database
      try {
        const db = await getDb();
        if (db) {
          await db.insert(querySessions).values({
            userId: 1, // Default user for now
            userQuery: input.user_query,
            status: 'completed' as const,
            finalAnswer: session.final_answer,
          });
        }
      } catch (dbError) {
        console.warn('Failed to persist session to database:', dbError);
        // Continue anyway - in-memory storage still works
      }

      return {
        session_id: session.id,
        status: session.status,
        chambers: session.chambers.map(c => ({
          name: c.name,
          input_text: c.input_text,
          output_text: c.output_text,
          metrics: c.metrics,
          entered_at: c.entered_at instanceof Date ? c.entered_at.toISOString() : c.entered_at,
          exited_at: c.exited_at instanceof Date ? c.exited_at.toISOString() : c.exited_at,
          recursion_depth: c.recursion_depth,
        })),
        witness_state: session.witness_state,
        corrections: session.corrections,
        final_answer: session.final_answer,
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error(`Failed to process query: ${(error as any).message}`);
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
      corrections = corrections.filter(c => c.reason && c.reason.includes(input.reason || ''));
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

const listSessionsProcedure = publicProcedure
  .input(z.object({
    limit: z.number().max(100).default(20),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const allSessions = await db
        .select()
        .from(querySessions)
        .orderBy(desc(querySessions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        sessions: allSessions.map(s => ({
          id: s.id,
          user_query: s.userQuery,
          status: s.status,
          created_at: s.createdAt,
          final_answer: s.finalAnswer?.substring(0, 200) || 'Processing...',
        })),
      };
    } catch (error) {
      console.error('Error listing sessions:', error);
      throw new Error(`Failed to list sessions: ${(error as any).message}`);
    }
  });

// Export session as JSON
const exportSessionProcedure = publicProcedure
  .input(z.object({
    session_id: z.number(),
  }))
  .query(async ({ input }) => {
    try {
      const session = sessions.get(input.session_id);
      if (!session) {
        throw new Error(`Session ${input.session_id} not found`);
      }

      return {
        session: {
          id: session.id,
          user_query: session.user_query,
          status: session.status,
          chambers: session.chambers,
          witness_state: session.witness_state,
          corrections: session.corrections,
          final_answer: session.final_answer,
          created_at: new Date(),
        },
      };
    } catch (error) {
      console.error('Error exporting session:', error);
      throw new Error(`Failed to export session: ${(error as any).message}`);
    }
  });

export const templeEngineRouter = router({
  listSessions: listSessionsProcedure,
  exportSession: exportSessionProcedure,
  createSession: createSessionProcedure,
  processQuery: processQueryProcedure,
  getSession: getSessionProcedure,
  streamSession: streamSessionProcedure,
  submitFeedback: submitFeedbackProcedure,
  getCorrectionJournal: getCorrectionJournalProcedure,
});
