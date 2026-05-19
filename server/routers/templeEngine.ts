import { z } from "zod";
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
        if (typeof (sessionResult as any).insertId === 'number') {
          sessionId = (sessionResult as any).insertId;
        } else if (Array.isArray(sessionResult) && sessionResult.length > 0) {
          sessionId = (sessionResult[0] as any).id || (sessionResult[0] as any).insertId;
        } else {
          throw new Error('Failed to extract session ID from insert result');
        }

        // Generate chamber outputs using LLM
        const chamberOutputs = await generateTempleEngineOutput(input.query, input.emotionalValence, input.urgency);

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
          chamberOutputs,
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
      return sessions.map((session) => ({
        id: session.id,
        query: session.query,
        emotionalValence: parseFloat(session.emotionalValence || "0"),
        urgency: parseFloat(session.urgency || "0.5"),
        createdAt: session.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching query history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch query history",
      });
    }
  }),

  // Get chamber states for a specific session
  getSessionDetails: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const chamberStates = await getChamberStatesBySessionId(input.sessionId);
        return chamberStates;
      } catch (error) {
        console.error("Error fetching session details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch session details",
        });
      }
    }),
});

/**
 * Generate Temple Engine output using LLM
 * This simulates the four-chamber processing pipeline
 */
async function generateTempleEngineOutput(
  query: string,
  emotionalValence: number,
  urgency: number
): Promise<ChamberOutput[]> {
  const systemPrompt = `You are the Temple Engine, a sacred cognitive architecture that processes queries through four chambers.

For each query, generate thoughtful, substantive interpretations that provide real answers and insights.

Outer Court: Identify the query's domain and context.
Inner Court: Generate 2-3 distinct interpretations with different perspectives and real content.
Holy Place: Filter and refine based on coherence and constraints.
Holy of Holies: Synthesize into a unified, coherent answer.

Return ONLY valid JSON, no markdown or extra text.`;

  const userPrompt = `Process this query through the Temple Engine and provide substantive, meaningful answers:

Query: "${query}"
Emotional Valence: ${emotionalValence} (0=neutral, 1=intense)
Urgency: ${urgency} (0=exploratory, 1=immediate)

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
[
  {
    "chamber": "outer_court",
    "tag": { "domain": "identify the subject domain", "context": "brief context", "emotional_valence": ${emotionalValence}, "urgency": ${urgency} },
    "interpretations": [{ "content": "initial interpretation of the query", "coherence": 0.7, "resonance": 0.7 }]
  },
  {
    "chamber": "inner_court",
    "interpretations": [
      { "content": "first substantive answer/interpretation", "coherence": 0.8, "resonance": 0.8 },
      { "content": "second perspective or interpretation", "coherence": 0.75, "resonance": 0.75 },
      { "content": "third angle or consideration", "coherence": 0.78, "resonance": 0.77 }
    ],
    "coherence_evolution": [0.65, 0.70, 0.75, 0.80, 0.82]
  },
  {
    "chamber": "holy_place",
    "constraints_applied": ["coherence_threshold", "resonance_alignment"],
    "interpretations": [{ "content": "refined synthesis of strongest interpretations", "coherence": 0.82, "resonance": 0.81 }]
  },
  {
    "chamber": "holy_of_holies",
    "final_output": { "content": "comprehensive final answer that synthesizes all perspectives", "coherence": 0.85, "resonance": 0.84 },
    "path_trace": { "input": "${query}", "chambers_traversed": ["outer_court", "inner_court", "holy_place", "holy_of_holies"], "final_collapse_point": "unified understanding" }
  }
]`;

  let lastError: Error | null = null;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Temple Engine] Invoking LLM (attempt ${attempt + 1}/${maxRetries + 1})`);

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      // Parse the LLM response
      const content = response.choices[0]?.message?.content;
      let responseText = "{}";
      if (typeof content === "string") {
        responseText = content;
      } else if (Array.isArray(content)) {
        responseText = content.map((c: any) => (c.type === "text" ? c.text : "")).join("");
      }

      // Clean up markdown code blocks if present
      responseText = responseText
        .replace(/^```json\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();

      const parsedResponse = JSON.parse(responseText);

      // Extract chambers array, handling both direct array and nested object
      let chambers = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.chambers || [];

      // Validate we have all four chambers with content
      if (Array.isArray(chambers) && chambers.length === 4) {
        const hasAllChambers = chambers.every((c: any) => c.chamber && c.interpretations);
        if (hasAllChambers) {
          console.log("[Temple Engine] Successfully generated output from LLM");
          return chambers;
        }
      }

      throw new Error("Invalid chamber structure from LLM");
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Temple Engine] LLM attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // If all retries failed, log and use default
  console.error(
    "[Temple Engine] All LLM attempts failed, using default outputs:",
    lastError?.message
  );
  return generateDefaultChamberOutputs(query);
}

/**
 * Generate default chamber outputs when LLM fails
 */
function generateDefaultChamberOutputs(query: string): ChamberOutput[] {
  return [
    {
      chamber: "outer_court",
      tag: {
        domain: "cognition",
        context: query.substring(0, 100),
        emotional_valence: 0,
        urgency: 0.5,
      },
      interpretations: [],
    },
    {
      chamber: "inner_court",
      interpretations: [
        {
          content: `Analytical interpretation: ${query}`,
          coherence: 0.75,
          resonance: 0.8,
          entanglement: [],
        },
        {
          content: `Intuitive interpretation: ${query}`,
          coherence: 0.7,
          resonance: 0.75,
          entanglement: [],
        },
      ],
      coherence_evolution: [0.7, 0.72, 0.75, 0.78, 0.8],
    },
    {
      chamber: "holy_place",
      constraints_applied: ["coherence_threshold: 0.5"],
      interpretations: [
        {
          content: `Analytical interpretation: ${query}`,
          coherence: 0.75,
          resonance: 0.8,
          entanglement: [],
        },
      ],
    },
    {
      chamber: "holy_of_holies",
      final_output: {
        content: `Unified understanding: ${query}`,
        coherence: 0.8,
        resonance: 0.85,
        entanglement: [],
      },
      path_trace: {
        input: query,
        chambers_traversed: ["outer_court", "inner_court", "holy_place", "holy_of_holies"],
        final_collapse_point: "Unified coherent state achieved",
      },
    },
  ];
}
