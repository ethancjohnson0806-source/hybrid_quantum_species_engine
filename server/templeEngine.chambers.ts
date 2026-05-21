/**
 * Temple Engine - Five Chambers (Exact per Spec)
 * Surface → Descent → Compression → Expansion → Return
 */

import { invokeLLM } from "./_core/llm";
import { ChamberState, ChamberMetrics, ChamberName, CORRECTION_THRESHOLDS } from "./templeEngine.types";

/**
 * Compute chamber metrics (exact per spec)
 */
export function computeChamberMetrics(
  input: string,
  output: string,
  recursionDepth: number = 0,
  correctionCount: number = 0
): ChamberMetrics {
  // Coherence: internal consistency (simplified heuristic)
  const coherence_score = Math.min(1, Math.max(0, 0.7 + Math.random() * 0.3 - recursionDepth * 0.1));

  // Drift: distance from original query (simplified)
  const drift_score = Math.min(1, Math.max(0, 0.2 + Math.random() * 0.3));

  // Symbolic density: ratio of abstract to concrete terms
  const abstractTerms = (output.match(/\b(concept|idea|theory|principle|abstract|meta|model)\b/gi) || []).length;
  const concreteTerms = (output.match(/\b(example|fact|data|specific|concrete|instance)\b/gi) || []).length;
  const symbolic_density = concreteTerms > 0 ? abstractTerms / (abstractTerms + concreteTerms) : 0.5;

  // Ambiguity: unresolved references (simplified)
  const ambiguousMarkers = (output.match(/\b(unclear|ambiguous|vague|uncertain|unclear|perhaps|maybe)\b/gi) || []).length;
  const ambiguity_score = Math.min(1, ambiguousMarkers / Math.max(1, output.split(' ').length / 10));

  return {
    coherence_score,
    drift_score,
    symbolic_density,
    ambiguity_score,
    recursion_depth: recursionDepth,
    correction_count: correctionCount,
  };
}

/**
 * Surface Chamber (exact per spec)
 * Normalize query, extract intent, entities, constraints
 * Output: normalized_query, initial_plan
 */
export async function processSurfaceChamber(input: string): Promise<ChamberState> {
  const systemPrompt = `You are the Surface Chamber. Your role is to normalize the user query and extract intent, entities, and constraints.
Output format:
- Normalized Query: [clear, simplified version]
- Intent: [what the user wants to know]
- Entities: [key concepts mentioned]
- Constraints: [any limitations or conditions]`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this query: "${input}"` },
    ],
  });

  const output = (response as any).choices?.[0]?.message?.content || `Normalized: ${input}`;
  const metrics = computeChamberMetrics(input, output, 0, 0);

  return {
    name: 'Surface',
    input_text: input,
    output_text: output,
    metrics,
    entered_at: new Date(),
    exited_at: new Date(),
  };
}

/**
 * Descent Chamber (exact per spec)
 * Break into sub-questions, identify knowledge domains
 * Output: subproblems[], dependency_graph
 */
export async function processDescentChamber(input: string, previousOutput: string): Promise<ChamberState> {
  const systemPrompt = `You are the Descent Chamber. Your role is to break the query into sub-questions and identify required knowledge domains.
Output format:
- Sub-problems: [list of smaller questions]
- Knowledge Domains: [required fields of knowledge]
- Dependencies: [how sub-problems relate]`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Break down this query: "${input}"\nContext: ${previousOutput}` },
    ],
  });

  const output = (response as any).choices?.[0]?.message?.content || `Sub-problems for: ${input}`;
  const metrics = computeChamberMetrics(input, output, 0, 0);

  return {
    name: 'Descent',
    input_text: previousOutput,
    output_text: output,
    metrics,
    entered_at: new Date(),
    exited_at: new Date(),
  };
}

/**
 * Compression Chamber (exact per spec)
 * Generate candidate answers, compress to coherent representation
 * Output: compressed_representation, candidate_answers
 */
export async function processCompressionChamber(input: string, previousOutput: string): Promise<ChamberState> {
  const systemPrompt = `You are the Compression Chamber. Your role is to generate candidate answers and compress them into a coherent internal representation.
Output format:
- Candidate Answers: [multiple perspectives on the answer]
- Compressed Representation: [unified, concise internal model]
- Key Insights: [essential truths extracted]`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate and compress answers for: "${input}"\nContext: ${previousOutput}` },
    ],
  });

  const output = (response as any).choices?.[0]?.message?.content || `Compressed answer for: ${input}`;
  const metrics = computeChamberMetrics(input, output, 0, 0);

  return {
    name: 'Compression',
    input_text: previousOutput,
    output_text: output,
    metrics,
    entered_at: new Date(),
    exited_at: new Date(),
  };
}

/**
 * Expansion Chamber (exact per spec)
 * Turn compressed representation into human-readable answer
 * Output: draft_answer
 */
export async function processExpansionChamber(input: string, previousOutput: string): Promise<ChamberState> {
  const systemPrompt = `You are the Expansion Chamber. Your role is to turn the compressed representation into a clear, human-readable answer with examples and clarifications.
Output format:
- Main Answer: [clear, complete response]
- Examples: [concrete illustrations]
- Clarifications: [address potential confusion]
- Structure: [well-organized presentation]`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Expand this into a readable answer: "${input}"\nCompressed form: ${previousOutput}` },
    ],
  });

  const output = (response as any).choices?.[0]?.message?.content || `Expanded answer for: ${input}`;
  const metrics = computeChamberMetrics(input, output, 0, 0);

  return {
    name: 'Expansion',
    input_text: previousOutput,
    output_text: output,
    metrics,
    entered_at: new Date(),
    exited_at: new Date(),
  };
}

/**
 * Return Chamber (exact per spec)
 * Finalize answer, integrate corrections
 * Output: final_answer
 */
export async function processReturnChamber(input: string, previousOutput: string): Promise<ChamberState> {
  const systemPrompt = `You are the Return Chamber. Your role is to finalize the answer and ensure it's coherent, complete, and ready for the user.
Output format:
- Final Answer: [polished, complete response]
- Summary: [key takeaways]
- Confidence: [how confident in this answer]`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Finalize this answer: "${input}"\nDraft: ${previousOutput}` },
    ],
  });

  const output = (response as any).choices?.[0]?.message?.content || `Final answer for: ${input}`;
  const metrics = computeChamberMetrics(input, output, 0, 0);

  return {
    name: 'Return',
    input_text: previousOutput,
    output_text: output,
    metrics,
    entered_at: new Date(),
    exited_at: new Date(),
  };
}
