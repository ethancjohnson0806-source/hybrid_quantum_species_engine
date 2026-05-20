/**
 * Temple Engine Pipeline - Executes the five-chamber reasoning process
 */

import { invokeLLM } from "./_core/llm";
import {
  ChamberName,
  ChamberState,
  CorrectionEvent,
  JourneyTrace,
  WitnessState,
  CHAMBER_ORDER,
  getNextChamber,
  computeChamberMetrics,
  shouldTriggerCorrection,
  computeWitnessState,
} from "./templeEngine.core";

interface PipelineContext {
  userQuery: string;
  chambers: ChamberState[];
  corrections: CorrectionEvent[];
  recursionDepth: number;
  maxRecursionDepth: number;
}

/**
 * Surface Chamber - Normalize and extract intent
 */
async function processSurfaceChamber(
  ctx: PipelineContext
): Promise<ChamberState> {
  const input = ctx.userQuery;
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are the Surface Chamber. Normalize the user query, extract intent, entities, and constraints. Be concise.",
      },
      {
        role: "user",
        content: `Normalize and extract intent from: "${input}"`,
      },
    ],
  });

  const output =
    (response as any).choices?.[0]?.message?.content ||
    `Normalized query: ${input}`;
  const metrics = computeChamberMetrics(input, output);

  return {
    name: "Surface",
    inputText: input,
    outputText: output,
    metrics,
    recursionDepth: ctx.recursionDepth,
    enteredAt: new Date(),
    exitedAt: new Date(),
  };
}

/**
 * Descent Chamber - Break into sub-questions
 */
async function processDescentChamber(
  ctx: PipelineContext
): Promise<ChamberState> {
  const previousOutput = ctx.chambers[ctx.chambers.length - 1]?.outputText || ctx.userQuery;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are the Descent Chamber. Break the query into sub-questions and identify knowledge domains.",
      },
      {
        role: "user",
        content: `Break down: "${previousOutput}"`,
      },
    ],
  });

  const output =
    (response as any).choices?.[0]?.message?.content ||
    `Sub-questions identified for: ${previousOutput}`;
  const metrics = computeChamberMetrics(previousOutput, output);

  return {
    name: "Descent",
    inputText: previousOutput,
    outputText: output,
    metrics,
    recursionDepth: ctx.recursionDepth,
    enteredAt: new Date(),
    exitedAt: new Date(),
  };
}

/**
 * Compression Chamber - Generate candidates and compress
 */
async function processCompressionChamber(
  ctx: PipelineContext
): Promise<ChamberState> {
  const previousOutput = ctx.chambers[ctx.chambers.length - 1]?.outputText || ctx.userQuery;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are the Compression Chamber. Generate candidate answers and compress into a coherent internal representation.",
      },
      {
        role: "user",
        content: `Compress and synthesize: "${previousOutput}"`,
      },
    ],
  });

  const output =
    (response as any).choices?.[0]?.message?.content ||
    `Compressed representation of: ${previousOutput}`;
  const metrics = computeChamberMetrics(previousOutput, output);

  return {
    name: "Compression",
    inputText: previousOutput,
    outputText: output,
    metrics,
    recursionDepth: ctx.recursionDepth,
    enteredAt: new Date(),
    exitedAt: new Date(),
  };
}

/**
 * Expansion Chamber - Make human-readable
 */
async function processExpansionChamber(
  ctx: PipelineContext
): Promise<ChamberState> {
  const previousOutput = ctx.chambers[ctx.chambers.length - 1]?.outputText || ctx.userQuery;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are the Expansion Chamber. Turn the compressed representation into a clear, human-readable answer with examples and clarifications.",
      },
      {
        role: "user",
        content: `Expand into a clear answer: "${previousOutput}"`,
      },
    ],
  });

  const output =
    (response as any).choices?.[0]?.message?.content ||
    `Expanded answer: ${previousOutput}`;
  const metrics = computeChamberMetrics(previousOutput, output);

  return {
    name: "Expansion",
    inputText: previousOutput,
    outputText: output,
    metrics,
    recursionDepth: ctx.recursionDepth,
    enteredAt: new Date(),
    exitedAt: new Date(),
  };
}

/**
 * Return Chamber - Finalize
 */
async function processReturnChamber(
  ctx: PipelineContext
): Promise<ChamberState> {
  const previousOutput = ctx.chambers[ctx.chambers.length - 1]?.outputText || ctx.userQuery;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are the Return Chamber. Finalize the answer, integrate any corrections, and prepare for return to the user.",
      },
      {
        role: "user",
        content: `Finalize: "${previousOutput}"`,
      },
    ],
  });

  const output =
    (response as any).choices?.[0]?.message?.content ||
    `Final answer: ${previousOutput}`;
  const metrics = computeChamberMetrics(previousOutput, output);

  return {
    name: "Return",
    inputText: previousOutput,
    outputText: output,
    metrics,
    recursionDepth: ctx.recursionDepth,
    enteredAt: new Date(),
    exitedAt: new Date(),
  };
}

/**
 * Execute the full pipeline
 */
export async function executeTempleEnginePipeline(
  userQuery: string
): Promise<JourneyTrace> {
  const ctx: PipelineContext = {
    userQuery,
    chambers: [],
    corrections: [],
    recursionDepth: 0,
    maxRecursionDepth: 3,
  };

  try {
    // Execute each chamber in sequence
    for (const chamberName of CHAMBER_ORDER) {
      let chamber: ChamberState;

      switch (chamberName) {
        case "Surface":
          chamber = await processSurfaceChamber(ctx);
          break;
        case "Descent":
          chamber = await processDescentChamber(ctx);
          break;
        case "Compression":
          chamber = await processCompressionChamber(ctx);
          break;
        case "Expansion":
          chamber = await processExpansionChamber(ctx);
          break;
        case "Return":
          chamber = await processReturnChamber(ctx);
          break;
        default:
          throw new Error(`Unknown chamber: ${chamberName}`);
      }

      ctx.chambers.push(chamber);

      // Check if correction is needed
      if (shouldTriggerCorrection(chamber.metrics) && ctx.recursionDepth < ctx.maxRecursionDepth) {
        const correction: CorrectionEvent = {
          chamberName,
          reason: "witness_flag",
          severity: chamber.metrics.coherenceScore < 0.4 ? "major" : "moderate",
          previousOutput: chamber.outputText,
          correctedOutput: chamber.outputText, // Would be re-run with correction context
          deltaSummary: `Coherence was ${chamber.metrics.coherenceScore.toFixed(2)}, drift was ${chamber.metrics.driftScore.toFixed(2)}`,
          timestamp: new Date(),
        };
        ctx.corrections.push(correction);
      }
    }

    // Compute final witness state
    const activeChamber = ctx.chambers[ctx.chambers.length - 1]?.name || "Return";
    const witnessState = computeWitnessState(
      ctx.chambers,
      ctx.corrections,
      activeChamber as ChamberName,
      ctx.recursionDepth
    );

    const finalAnswer = ctx.chambers[ctx.chambers.length - 1]?.outputText || userQuery;

    return {
      userQuery,
      chambers: ctx.chambers,
      witnessState,
      corrections: ctx.corrections,
      finalAnswer,
      status: "completed",
    };
  } catch (error) {
    console.error("Pipeline error:", error);
    return {
      userQuery,
      chambers: ctx.chambers,
      witnessState: computeWitnessState(ctx.chambers, ctx.corrections, "Return", ctx.recursionDepth),
      corrections: ctx.corrections,
      finalAnswer: `Error processing query: ${(error as any).message}`,
      status: "error",
    };
  }
}
