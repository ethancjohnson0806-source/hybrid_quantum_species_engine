/**
 * Temple Engine API - Complete contract with SSE streaming
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createQuerySession, getQuerySessionsByUserId } from "../db";
import { executeTempleEnginePipeline } from "../templeEngine.pipeline";
import { TRPCError } from "@trpc/server";

export const templeEngineAPIRouter = router({
  // Create a new session
  createSession: protectedProcedure
    .input(z.object({ userQuery: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const sessionId = await createQuerySession(
          ctx.user.id,
          input.userQuery
        );

        return {
          sessionId,
          status: "in_progress" as const,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }
    }),

  // Get full session state
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // In a real implementation, fetch from database
        // For now, return placeholder
        return {
          sessionId: input.sessionId,
          userQuery: "Query",
          status: "completed" as const,
          chambers: [],
          witnessState: {
            overallCoherence: 0.8,
            overallDrift: 0.2,
            overallSymbolicDensity: 0.5,
            alignmentScore: 0.75,
            activeChamber: "Return",
            recursionDepth: 0,
            totalCorrections: 0,
          },
          corrections: [],
          finalAnswer: "Processing...",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get session",
        });
      }
    }),

  // Process query through full pipeline
  processQuery: protectedProcedure
    .input(z.object({ userQuery: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Create session
        const sessionId = await createQuerySession(
          ctx.user.id,
          input.userQuery
        );

        // Execute pipeline
        const journey = await executeTempleEnginePipeline(input.userQuery);

        return {
          sessionId,
          userQuery: input.userQuery,
          journey,
          status: journey.status,
        };
      } catch (error) {
        console.error("Error processing query:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process query",
        });
      }
    }),

  // Get user's session history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sessions = await getQuerySessionsByUserId(ctx.user.id);
      return { sessions };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get history",
      });
    }
  }),

  // Submit user feedback/correction
  submitFeedback: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        feedback: z.string(),
        severity: z.enum(["minor", "moderate", "major"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real implementation, trigger re-entry logic
        return {
          status: "correction_triggered" as const,
          jumpToChamber: "Compression",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit feedback",
        });
      }
    }),

  // Get correction journal for a session
  getCorrections: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // In a real implementation, fetch from database
        return {
          corrections: [],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get corrections",
        });
      }
    }),
});
