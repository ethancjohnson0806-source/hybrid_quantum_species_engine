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
        const sessionId = (sessionResult as any).insertId || (sessionResult as any)[0];

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
  const systemPrompt = `You are the Temple Engine, a sacred cognitive architecture that processes queries through four chambers: Outer Court, Inner Court, Holy Place, and Holy of Holies.

For the given query, generate structured JSON outputs for each chamber:
1. Outer Court: Input tagging with domain detection
2. Inner Court: Generate multiple interpretations with resonance scoring
3. Holy Place: Apply constraints and filter interpretations
4. Holy of Holies: Collapse to final unified state

Return a JSON array with objects for each chamber containing the specified fields.`;

  const userPrompt = `Process this query through the Temple Engine:
Query: "${query}"
Emotional Valence: ${emotionalValence}
Urgency: ${urgency}

Return a JSON array with four objects (one per chamber) in this exact format:
[
  {
    "chamber": "outer_court",
    "tag": { "domain": "...", "context": "...", "emotional_valence": ..., "urgency": ... },
    "interpretations": []
  },
  {
    "chamber": "inner_court",
    "interpretations": [{ "content": "...", "coherence": ..., "resonance": ..., "entanglement": [] }],
    "coherence_evolution": [0.7, 0.75, 0.8, 0.85, 0.9]
  },
  {
    "chamber": "holy_place",
    "constraints_applied": ["..."],
    "interpretations": [{ "content": "...", "coherence": ..., "resonance": ..., "entanglement": [] }]
  },
  {
    "chamber": "holy_of_holies",
    "final_output": { "content": "...", "coherence": ..., "resonance": ..., "entanglement": [] },
    "path_trace": { "input": "...", "chambers_traversed": [...], "final_collapse_point": "..." }
  }
]`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "temple_engine_output",
          strict: false,
          schema: {
            type: "object",
            properties: {
              chambers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    chamber: { type: "string" },
                    tag: { type: "object" },
                    interpretations: { type: "array" },
                    constraints_applied: { type: "array" },
                    coherence_evolution: { type: "array" },
                    final_output: { type: "object" },
                    path_trace: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Parse the LLM response
    const content = response.choices[0]?.message?.content;
    let responseText = "{}";
    if (typeof content === "string") {
      responseText = content;
    } else if (Array.isArray(content)) {
      responseText = content.map((c: any) => (c.type === "text" ? c.text : "")).join("");
    }
    const parsedResponse = JSON.parse(responseText);

    // Extract chambers array, handling both direct array and nested object
    let chambers = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.chambers || [];

    // Ensure we have all four chambers
    if (!Array.isArray(chambers) || chambers.length === 0) {
      chambers = generateDefaultChamberOutputs(query);
    }

    return chambers;
  } catch (error) {
    console.error("Error generating Temple Engine output:", error);
    // Return default outputs if LLM fails
    return generateDefaultChamberOutputs(query);
  }
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
