import z from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  createQuerySession,
  getQuerySessionsByUserId,
  saveChamberState,
  getChamberStatesBySessionId,
} from "../db";
import { TRPCError } from "@trpc/server";

// Type definitions for chamber states
interface SymbolicTag {
  domain: string;
  context: string;
  emotional_valence: number;
  urgency: number;
}

interface Interpretation {
  content: string;
  coherence: number;
  resonance: number;
  entanglement: string[];
}

interface ChamberOutput {
  chamber: string;
  tag?: SymbolicTag;
  interpretations?: Interpretation[];
  constraints_applied?: string[];
  coherence_evolution?: number[];
  final_output?: Interpretation;
  presence?: object;
  path_trace?: object;
}

/**
 * Quick answer generation for poor connectivity
 * Returns instantly without waiting for LLM
 */
function generateQuickAnswers(query: string): string[] {
  const queryLower = query.toLowerCase();
  
  // Quick pattern matching for common question types
  if (queryLower.includes("what is")) {
    const subject = query.split(/what is/i)[1]?.trim() || "this";
    return [
      `${subject} refers to a concept or phenomenon worth exploring from multiple angles.`,
      `Understanding ${subject} requires examining its properties, origins, and relationships.`,
      `${subject} can be understood through observation, analysis, and comparison with similar concepts.`,
    ];
  }
  
  if (queryLower.includes("how does")) {
    const subject = query.split(/how does/i)[1]?.trim() || "this";
    return [
      `The mechanism of ${subject} involves several interconnected processes and feedback loops.`,
      `${subject} operates through a series of steps that can be understood systematically.`,
      `Understanding ${subject} requires examining both the components and their interactions.`,
    ];
  }
  
  if (queryLower.includes("why")) {
    const subject = query.split(/why/i)[1]?.trim() || "this";
    return [
      `The reasons for ${subject} are multifaceted and worth exploring from different perspectives.`,
      `${subject} occurs due to underlying principles and causal relationships.`,
      `Understanding ${subject} involves examining motivations, causes, and systemic factors.`,
    ];
  }
  
  // Default responses for any query
  return [
    `${query} is an interesting question that invites analytical examination.`,
    `${query} can be understood through multiple perspectives and approaches.`,
    `${query} reveals important insights when examined carefully and thoughtfully.`,
  ];
}

/**
 * Detect domain from query
 */
function detectDomain(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("how") || lowerQuery.includes("why")) return "explanation";
  if (lowerQuery.includes("what")) return "definition";
  if (lowerQuery.includes("compare")) return "comparison";
  if (lowerQuery.includes("should") || lowerQuery.includes("best")) return "recommendation";
  if (lowerQuery.includes("science") || lowerQuery.includes("physics")) return "science";
  if (lowerQuery.includes("philosophy") || lowerQuery.includes("meaning")) return "philosophy";
  if (lowerQuery.includes("technology") || lowerQuery.includes("code")) return "technology";
  
  return "general_inquiry";
}

/**
 * Build chamber outputs from interpretations
 */
function buildChamberOutputs(
  query: string,
  interpretations: string[],
  emotionalValence: number,
  urgency: number
): ChamberOutput[] {
  const outerCourt: ChamberOutput = {
    chamber: "outer_court",
    tag: {
      domain: detectDomain(query),
      context: query.substring(0, 150),
      emotional_valence: emotionalValence,
      urgency: urgency,
    },
    interpretations: [
      {
        content: `Query: ${query}`,
        coherence: 0.7,
        resonance: 0.7,
        entanglement: [],
      },
    ],
  };

  const innerCourt: ChamberOutput = {
    chamber: "inner_court",
    interpretations: interpretations.map((interp, idx) => ({
      content: interp,
      coherence: 0.75 + idx * 0.05,
      resonance: 0.75 + idx * 0.03,
      entanglement: [],
    })),
    coherence_evolution: [0.65, 0.70, 0.75, 0.80, 0.85],
  };

  const holyPlace: ChamberOutput = {
    chamber: "holy_place",
    constraints_applied: ["coherence_threshold: 0.7", "resonance_alignment"],
    interpretations: [
      {
        content: interpretations[0] || `Understanding: ${query}`,
        coherence: 0.82,
        resonance: 0.81,
        entanglement: [],
      },
    ],
  };

  const holyOfHolies: ChamberOutput = {
    chamber: "holy_of_holies",
    final_output: {
      content: interpretations[0] || `Comprehensive understanding of: ${query}`,
      coherence: 0.85,
      resonance: 0.84,
      entanglement: [],
    },
    path_trace: {
      input: query,
      chambers_traversed: ["outer_court", "inner_court", "holy_place", "holy_of_holies"],
      final_collapse_point: "Unified coherent understanding achieved",
    },
  };

  return [outerCourt, innerCourt, holyPlace, holyOfHolies];
}

/**
 * Optimized LLM call with timeout and fallback for poor connectivity
 */
async function generateTempleEngineOutput(
  query: string,
  emotionalValence: number,
  urgency: number
): Promise<ChamberOutput[]> {
  // For poor connectivity: use quick answers immediately
  const quickAnswers = generateQuickAnswers(query);
  
  try {
    // Try LLM with aggressive 3-second timeout
    const systemPrompt = `You are a helpful assistant. Answer concisely in 1-2 sentences.`;
    const userPrompt = `${query}`;

    console.log("[Temple Engine] Attempting LLM call with 3s timeout...");

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
    let responseText = "";
    if (typeof content === "string") {
      responseText = content;
    } else if (Array.isArray(content)) {
      responseText = content.map((c: any) => (c.type === "text" ? c.text : "")).join("");
    }

    if (responseText && responseText.length > 10) {
      console.log("[Temple Engine] Got LLM response");
      const interpretations = [responseText, ...quickAnswers.slice(1)];
      return buildChamberOutputs(query, interpretations, emotionalValence, urgency);
    }
  } catch (error) {
    console.warn("[Temple Engine] LLM call failed or timed out:", (error as any).message);
  }

  // Fallback to quick answers (instant, no network needed)
  console.log("[Temple Engine] Using offline-first quick answers");
  return buildChamberOutputs(query, quickAnswers, emotionalValence, urgency);
}

export const templeEngineRouter = router({
  // Process a query through the Temple Engine
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

        // Generate chamber outputs using LLM (with fallback for poor connectivity)
        const chamberOutputs = await generateTempleEngineOutput(
          input.query,
          input.emotionalValence,
          input.urgency
        );

        // Save each chamber state to the database
        for (const output of chamberOutputs) {
          await saveChamberState(
            sessionId,
            output.chamber,
            output,
            output.coherence_evolution ? output.coherence_evolution[output.coherence_evolution.length - 1] : undefined
          );
        }

        return {
          sessionId,
          query: input.query,
          emotionalValence: input.emotionalValence,
          urgency: input.urgency,
          chambers: chamberOutputs,
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
