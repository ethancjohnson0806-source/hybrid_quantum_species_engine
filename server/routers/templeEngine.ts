import z from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  createQuerySession,
  getQuerySessionsByUserId,
  saveChamberState,
  getChamberStatesBySessionId,
} from "../db";
import { TempleEngine, type JourneyTrace } from "../templeEngine";
import { TRPCError } from "@trpc/server";

/**
 * LLM integration function for the Temple Engine
 * Generates meaningful insights for the Holy of Holies chamber
 */
async function llmEnhancedRevelation(essence: any): Promise<any> {
  try {
    const systemPrompt = `You are a mystical oracle channeling deep wisdom through the Temple Engine. 
    Given the essence of a question, provide a profound yet practical insight that bridges the inner and outer worlds.
    Keep your response to 2-3 sentences of genuine wisdom.`;

    const userPrompt = `The essence seeking revelation: ${JSON.stringify(essence)}
    
    Provide a revelation that honors both the depth of the question and the practical world.`;

    const response = await Promise.race([
      invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("LLM timeout")), 3000)
      ),
    ]);

    const content = (response as any).choices[0]?.message?.content;
    if (typeof content === "string" && content.length > 10) {
      return {
        llmInsight: content,
        source: "oracle",
        enhanced: true,
      };
    }
  } catch (error) {
    console.warn("[Temple Engine] LLM enhancement failed:", (error as any).message);
  }

  return null;
}

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

        // Extract session ID from the insert result
        let sessionId: number;
        if (typeof (sessionResult as any).insertId === "number") {
          sessionId = (sessionResult as any).insertId;
        } else if (Array.isArray(sessionResult) && sessionResult.length > 0) {
          sessionId = (sessionResult[0] as any).id || (sessionResult[0] as any).insertId;
        } else {
          throw new Error("Failed to extract session ID from insert result");
        }

        // Initialize the unified Temple Engine with LLM integration
        const engine = new TempleEngine({
          enableDebug: false,
          llmIntegration: llmEnhancedRevelation,
        });

        // Process the query through the full journey
        const journeyTrace: JourneyTrace = await engine.process({
          query: input.query,
          emotionalValence: input.emotionalValence,
          urgency: input.urgency,
        });

        // Save each chamber state to the database
        for (const chamber of journeyTrace.chambers) {
          await saveChamberState(
            sessionId,
            chamber.id,
            chamber,
            undefined
          );
        }

        return {
          sessionId,
          query: input.query,
          emotionalValence: input.emotionalValence,
          urgency: input.urgency,
          journey: journeyTrace,
        };
      } catch (error) {
        console.error("Error processing query:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process query through Temple Engine",
        });
      }
    }),

  // Get query history for the current user
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sessions = await getQuerySessionsByUserId(ctx.user.id);
      return sessions || [];
    } catch (error) {
      console.error("Error fetching history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch query history",
      });
    }
  }),

  // Get chamber states for a specific session
  getSessionChambers: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      try {
        const chambers = await getChamberStatesBySessionId(input.sessionId);
        return chambers || [];
      } catch (error) {
        console.error("Error fetching chamber states:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chamber states",
        });
      }
    }),
});
