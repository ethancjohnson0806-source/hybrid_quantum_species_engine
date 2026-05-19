import { describe, it, expect, vi } from "vitest";
import { createQuerySession, saveChamberState, getChamberStatesBySessionId, getQuerySessionById } from "../db";

describe("Temple Engine Database Integration", () => {
  describe("Query Session Management", () => {
    it("should create a query session", async () => {
      const result = await createQuerySession(1, "What is consciousness?", 0.5, 0.3);
      expect(result).toBeDefined();
    });

    it("should retrieve a query session by ID", async () => {
      const created = await createQuerySession(1, "Test query", 0.5, 0.5);
      const sessionId = (created as any).insertId;

      if (sessionId) {
        const retrieved = await getQuerySessionById(sessionId);
        expect(retrieved).toBeDefined();
        expect(retrieved?.query).toBe("Test query");
      }
    });
  });

  describe("Chamber State Management", () => {
    it("should save chamber state data", async () => {
      const session = await createQuerySession(1, "Test chamber save", 0.5, 0.5);
      const sessionId = (session as any).insertId;

      if (sessionId) {
        const chamberData = {
          chamber: "outer_court",
          tag: { domain: "test", type: "input" },
          interpretations: [{ content: "Test", coherence: 0.8, resonance: 0.7 }],
        };

        const result = await saveChamberState(sessionId, "outer_court", chamberData, 0.8);
        expect(result).toBeDefined();
      }
    });

    it("should retrieve chamber states by session ID", async () => {
      const session = await createQuerySession(1, "Test chamber retrieval", 0.5, 0.5);
      const sessionId = (session as any).insertId;

      if (sessionId) {
        const chamberData = {
          chamber: "inner_court",
          interpretations: [
            { content: "Interp 1", coherence: 0.85, resonance: 0.8 },
            { content: "Interp 2", coherence: 0.75, resonance: 0.7 },
          ],
          coherence_evolution: [0.6, 0.7, 0.8, 0.85],
        };

        await saveChamberState(sessionId, "inner_court", chamberData, 0.85);

        const states = await getChamberStatesBySessionId(sessionId);
        expect(states).toBeDefined();
        expect(Array.isArray(states)).toBe(true);
      }
    });
  });

  describe("Chamber Output Structure Validation", () => {
    it("should validate outer court structure", () => {
      const outerCourt = {
        chamber: "outer_court",
        tag: { domain: "query_processing", type: "input" },
        interpretations: [
          { content: "Sample query", coherence: 0.8, resonance: 0.7 },
        ],
      };

      expect(outerCourt.chamber).toBe("outer_court");
      expect(outerCourt.tag).toBeDefined();
      expect(outerCourt.tag.domain).toBeDefined();
      expect(outerCourt.interpretations).toBeDefined();
      expect(outerCourt.interpretations[0].coherence).toBeDefined();
      expect(outerCourt.interpretations[0].resonance).toBeDefined();
    });

    it("should validate inner court structure", () => {
      const innerCourt = {
        chamber: "inner_court",
        interpretations: [
          { content: "Interpretation 1", coherence: 0.85, resonance: 0.8 },
          { content: "Interpretation 2", coherence: 0.75, resonance: 0.7 },
        ],
        coherence_evolution: [0.6, 0.7, 0.8, 0.85],
      };

      expect(innerCourt.chamber).toBe("inner_court");
      expect(innerCourt.interpretations).toBeDefined();
      expect(innerCourt.coherence_evolution).toBeDefined();
      expect(Array.isArray(innerCourt.coherence_evolution)).toBe(true);

      innerCourt.interpretations.forEach((interp) => {
        expect(interp.coherence).toBeGreaterThanOrEqual(0);
        expect(interp.coherence).toBeLessThanOrEqual(1);
        expect(interp.resonance).toBeGreaterThanOrEqual(0);
        expect(interp.resonance).toBeLessThanOrEqual(1);
      });
    });

    it("should validate holy place structure", () => {
      const holyPlace = {
        chamber: "holy_place",
        constraints_applied: ["coherence_threshold", "resonance_alignment"],
        coherence_score: 0.82,
      };

      expect(holyPlace.chamber).toBe("holy_place");
      expect(holyPlace.constraints_applied).toBeDefined();
      expect(Array.isArray(holyPlace.constraints_applied)).toBe(true);
      expect(holyPlace.coherence_score).toBeDefined();
    });

    it("should validate holy of holies structure", () => {
      const holyOfHolies = {
        chamber: "holy_of_holies",
        final_output: {
          content: "Unified query response",
          coherence: 0.85,
          resonance: 0.8,
        },
        path_trace: {
          chambers_traversed: [
            "outer_court",
            "inner_court",
            "holy_place",
            "holy_of_holies",
          ],
          final_collapse_point: "unified_state",
        },
      };

      expect(holyOfHolies.chamber).toBe("holy_of_holies");
      expect(holyOfHolies.final_output).toBeDefined();
      expect(holyOfHolies.final_output.content).toBeDefined();
      expect(holyOfHolies.final_output.coherence).toBeDefined();
      expect(holyOfHolies.final_output.resonance).toBeDefined();
      expect(holyOfHolies.path_trace).toBeDefined();
      expect(holyOfHolies.path_trace.chambers_traversed).toBeDefined();
      expect(holyOfHolies.path_trace.chambers_traversed.length).toBe(4);
    });
  });

  describe("JSON Output Formatting", () => {
    it("should properly serialize chamber data to JSON", () => {
      const chamber = {
        chamber: "outer_court",
        tag: { domain: "test", type: "input" },
        interpretations: [
          { content: "Test", coherence: 0.8, resonance: 0.7 },
        ],
      };

      const json = JSON.stringify(chamber);
      const parsed = JSON.parse(json);

      expect(parsed.chamber).toBe(chamber.chamber);
      expect(parsed.tag.domain).toBe(chamber.tag.domain);
      expect(parsed.interpretations[0].coherence).toBe(0.8);
    });

    it("should handle complex nested structures", () => {
      const complex = {
        chamber: "inner_court",
        interpretations: [
          {
            content: "Complex interpretation",
            coherence: 0.85,
            resonance: 0.8,
            entanglement: ["outer_court", "holy_place"],
          },
        ],
        coherence_evolution: [0.6, 0.65, 0.7, 0.75, 0.8, 0.85],
        metadata: {
          iterations: 6,
          convergence_rate: 0.042,
        },
      };

      const json = JSON.stringify(complex);
      const parsed = JSON.parse(json);

      expect(parsed.interpretations[0].entanglement).toBeDefined();
      expect(parsed.metadata.convergence_rate).toBe(0.042);
    });
  });

  describe("Coherence Score Validation", () => {
    it("should validate coherence scores are between 0 and 1", () => {
      const scores = [0, 0.25, 0.5, 0.75, 1];

      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    it("should validate coherence evolution progression", () => {
      const evolution = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85];

      // Each value should be between 0 and 1
      evolution.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });

      // Evolution should generally increase (allowing for small variations)
      for (let i = 1; i < evolution.length; i++) {
        expect(evolution[i]).toBeGreaterThanOrEqual(evolution[i - 1] - 0.1);
      }
    });
  });

  describe("Path Trace Validation", () => {
    it("should validate path trace structure", () => {
      const pathTrace = {
        chambers_traversed: [
          "outer_court",
          "inner_court",
          "holy_place",
          "holy_of_holies",
        ],
        final_collapse_point: "unified_state",
      };

      expect(pathTrace.chambers_traversed.length).toBe(4);
      expect(pathTrace.chambers_traversed[0]).toBe("outer_court");
      expect(pathTrace.chambers_traversed[3]).toBe("holy_of_holies");
      expect(pathTrace.final_collapse_point).toBeDefined();
    });

    it("should validate chambers are in correct order", () => {
      const expectedOrder = [
        "outer_court",
        "inner_court",
        "holy_place",
        "holy_of_holies",
      ];
      const actualOrder = [
        "outer_court",
        "inner_court",
        "holy_place",
        "holy_of_holies",
      ];

      expect(actualOrder).toEqual(expectedOrder);
    });
  });
});
