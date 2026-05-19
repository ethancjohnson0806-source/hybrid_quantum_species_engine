import { describe, it, expect, vi } from "vitest";
import { invokeLLM } from "../_core/llm";

/**
 * Test to verify that the LLM is generating real, substantive answers
 * rather than just placeholder data.
 */
describe("Temple Engine LLM Integration", () => {
  it("should generate substantive answers for consciousness query", async () => {
    const query = "What is consciousness?";
    const emotionalValence = 0.5;
    const urgency = 0.3;

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

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      expect(content).toBeDefined();

      // Parse the response
      let responseText = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.type === "text" ? c.text : "").join("") : "{}";
      responseText = responseText.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();

      const parsed = JSON.parse(responseText);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(4);

      // Verify each chamber has content
      const chambers = parsed;
      
      // Outer Court
      expect(chambers[0].chamber).toBe("outer_court");
      expect(chambers[0].tag).toBeDefined();
      expect(chambers[0].tag.domain).toBeDefined();
      expect(chambers[0].tag.domain.length).toBeGreaterThan(0);
      
      // Inner Court
      expect(chambers[1].chamber).toBe("inner_court");
      expect(chambers[1].interpretations).toBeDefined();
      expect(chambers[1].interpretations.length).toBeGreaterThanOrEqual(2);
      
      // Verify interpretations have real content (not just placeholders)
      chambers[1].interpretations.forEach((interp: any) => {
        expect(interp.content).toBeDefined();
        expect(interp.content.length).toBeGreaterThan(10); // Real content should be substantial
        expect(interp.coherence).toBeGreaterThanOrEqual(0);
        expect(interp.coherence).toBeLessThanOrEqual(1);
        expect(interp.resonance).toBeGreaterThanOrEqual(0);
        expect(interp.resonance).toBeLessThanOrEqual(1);
      });

      // Holy Place
      expect(chambers[2].chamber).toBe("holy_place");
      expect(chambers[2].constraints_applied).toBeDefined();
      expect(Array.isArray(chambers[2].constraints_applied)).toBe(true);
      
      // Holy of Holies
      expect(chambers[3].chamber).toBe("holy_of_holies");
      expect(chambers[3].final_output).toBeDefined();
      expect(chambers[3].final_output.content).toBeDefined();
      expect(chambers[3].final_output.content.length).toBeGreaterThan(10); // Final answer should be substantial
      expect(chambers[3].path_trace).toBeDefined();
      expect(chambers[3].path_trace.chambers_traversed).toBeDefined();
      expect(chambers[3].path_trace.chambers_traversed.length).toBe(4);

      console.log("\n✅ LLM generated substantive answers:");
      console.log("- Outer Court domain:", chambers[0].tag.domain);
      console.log("- Inner Court interpretations:", chambers[1].interpretations.length);
      console.log("- Holy Place constraints:", chambers[2].constraints_applied);
      console.log("- Final output length:", chambers[3].final_output.content.length, "chars");
    } catch (error) {
      console.error("LLM test failed:", error);
      throw error;
    }
  }, { timeout: 60000 });

  it("should handle different query types", async () => {
    const queries = [
      "How does photosynthesis work?",
      "What are the implications of quantum computing?",
      "Explain the concept of entropy",
    ];

    for (const query of queries) {
      const systemPrompt = `You are a helpful assistant that provides substantive, meaningful answers.`;
      const userPrompt = `Answer this question concisely: ${query}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const content = response.choices[0]?.message?.content;
        expect(content).toBeDefined();

        // Verify we got a real answer (not empty or placeholder)
        const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.type === "text" ? c.text : "").join("") : "";
        expect(text.length).toBeGreaterThan(20);

        console.log(`✅ Query answered: "${query.substring(0, 40)}..."`);
      } catch (error) {
        console.error(`Failed to answer: ${query}`, error);
        throw error;
      }
    }
  }, { timeout: 90000 });
});
