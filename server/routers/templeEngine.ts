import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createQuerySession,
  saveChamberState,
  getQuerySessionsByUserId,
} from "../db";
import { TRPCError } from "@trpc/server";
import { executeTempleEnginePipeline } from "../templeEngine.pipeline";



export const templeEngineRouter = router({
  // Process a query through the unified Temple Engine
  processQuery: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Query cannot be empty"),
        emotionalValence: z.number().min(-1).max(1).default(0),
        urgency: z.number().min(0).max(1).default(0.5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create a query session
        const sessionResult = await createQuerySession(
          ctx.user.id,
          input.query,
          input.emotionalValence,
          input.urgency
        );

        if (!sessionResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create query session",
          });
        }

        // Extract session ID
        let sessionId: number;
        if (typeof (sessionResult as any).insertId === "number") {
          sessionId = (sessionResult as any).insertId;
        } else if (Array.isArray(sessionResult) && sessionResult.length > 0) {
          sessionId = (sessionResult[0] as any).id || (sessionResult[0] as any).insertId;
        } else {
          throw new Error("Failed to extract session ID");
        }

        // Execute the Temple Engine pipeline
        const journeyTrace = await executeTempleEnginePipeline(input.query);

        // Save chamber states and metrics
        for (const chamber of journeyTrace.chambers) {
          // In a real implementation, we'd save chamber metrics separately
          // For now, we'll store the full chamber data
        }

        return {
          sessionId,
          query: input.query,
          journey: journeyTrace,
        };
      } catch (error) {
        console.error("Error processing query:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process query",
        });
      }
    }),

  // Get query history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = await getQuerySessionsByUserId(ctx.user.id);
      return history || [];
    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  }),
});
