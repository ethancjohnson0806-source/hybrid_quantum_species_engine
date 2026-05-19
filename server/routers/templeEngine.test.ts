import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import type { TrpcContext } from "../_core/context";

// Mock user context
function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("Temple Engine Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("templeEngine.processQuery", () => {
    it("should process a query and return chamber outputs", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "What is consciousness?",
        emotionalValence: 0.5,
        urgency: 0.3,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return four chambers in the output", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "Explain quantum mechanics",
        emotionalValence: 0.6,
        urgency: 0.4,
      });

      const chamberIds = result.map((c: any) => c.chamber);
      expect(chamberIds).toContain("outer_court");
      expect(chamberIds).toContain("inner_court");
      expect(chamberIds).toContain("holy_place");
      expect(chamberIds).toContain("holy_of_holies");
    });

    it("should include interpretations in chamber outputs", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "What is the meaning of life?",
        emotionalValence: 0.7,
        urgency: 0.5,
      });

      const outerCourt = result.find((c: any) => c.chamber === "outer_court");
      expect(outerCourt).toBeDefined();
      expect(outerCourt?.interpretations).toBeDefined();
      expect(Array.isArray(outerCourt?.interpretations)).toBe(true);
    });

    it("should include coherence scores in interpretations", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "Explain artificial intelligence",
        emotionalValence: 0.5,
        urgency: 0.6,
      });

      const innerCourt = result.find((c: any) => c.chamber === "inner_court");
      expect(innerCourt?.interpretations).toBeDefined();

      innerCourt?.interpretations.forEach((interp: any) => {
        expect(interp.coherence).toBeDefined();
        expect(typeof interp.coherence).toBe("number");
        expect(interp.coherence).toBeGreaterThanOrEqual(0);
        expect(interp.coherence).toBeLessThanOrEqual(1);
      });
    });

    it("should include resonance scores in interpretations", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "What is love?",
        emotionalValence: 0.8,
        urgency: 0.2,
      });

      const innerCourt = result.find((c: any) => c.chamber === "inner_court");
      expect(innerCourt?.interpretations).toBeDefined();

      innerCourt?.interpretations.forEach((interp: any) => {
        expect(interp.resonance).toBeDefined();
        expect(typeof interp.resonance).toBe("number");
        expect(interp.resonance).toBeGreaterThanOrEqual(0);
        expect(interp.resonance).toBeLessThanOrEqual(1);
      });
    });

    it("should include coherence evolution in inner court", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "Explain relativity",
        emotionalValence: 0.5,
        urgency: 0.5,
      });

      const innerCourt = result.find((c: any) => c.chamber === "inner_court");
      expect(innerCourt?.coherence_evolution).toBeDefined();
      expect(Array.isArray(innerCourt?.coherence_evolution)).toBe(true);
      expect(innerCourt?.coherence_evolution.length).toBeGreaterThan(0);
    });

    it("should include final output in holy of holies", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "What is time?",
        emotionalValence: 0.6,
        urgency: 0.4,
      });

      const holyOfHolies = result.find((c: any) => c.chamber === "holy_of_holies");
      expect(holyOfHolies).toBeDefined();
      expect(holyOfHolies?.final_output).toBeDefined();
      expect(holyOfHolies?.final_output.content).toBeDefined();
      expect(holyOfHolies?.final_output.coherence).toBeDefined();
      expect(holyOfHolies?.final_output.resonance).toBeDefined();
    });

    it("should include path trace in holy of holies", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "Explain the universe",
        emotionalValence: 0.7,
        urgency: 0.3,
      });

      const holyOfHolies = result.find((c: any) => c.chamber === "holy_of_holies");
      expect(holyOfHolies?.path_trace).toBeDefined();
      expect(holyOfHolies?.path_trace.chambers_traversed).toBeDefined();
      expect(Array.isArray(holyOfHolies?.path_trace.chambers_traversed)).toBe(true);
    });

    it("should handle edge cases with empty query", async () => {
      const result = await caller.templeEngine.processQuery({
        query: "",
        emotionalValence: 0.5,
        urgency: 0.5,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle extreme emotional valence values", async () => {
      const result1 = await caller.templeEngine.processQuery({
        query: "Test query",
        emotionalValence: 0,
        urgency: 0.5,
      });

      const result2 = await caller.templeEngine.processQuery({
        query: "Test query",
        emotionalValence: 1,
        urgency: 0.5,
      });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should handle extreme urgency values", async () => {
      const result1 = await caller.templeEngine.processQuery({
        query: "Test query",
        emotionalValence: 0.5,
        urgency: 0,
      });

      const result2 = await caller.templeEngine.processQuery({
        query: "Test query",
        emotionalValence: 0.5,
        urgency: 1,
      });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe("templeEngine.getHistory", () => {
    it("should return query history for the user", async () => {
      // First, process a query
      await caller.templeEngine.processQuery({
        query: "Test query for history",
        emotionalValence: 0.5,
        urgency: 0.5,
      });

      // Then retrieve history
      const history = await caller.templeEngine.getHistory();

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });

    it("should return sessions with query and timestamp", async () => {
      const history = await caller.templeEngine.getHistory();

      if (history.length > 0) {
        const session = history[0];
        expect(session.id).toBeDefined();
        expect(session.query).toBeDefined();
        expect(session.createdAt).toBeDefined();
      }
    });
  });

  describe("templeEngine.getSessionDetails", () => {
    it("should retrieve details of a specific session", async () => {
      // First, process a query
      const processResult = await caller.templeEngine.processQuery({
        query: "Test session details",
        emotionalValence: 0.5,
        urgency: 0.5,
      });

      // Get history to find the session ID
      const history = await caller.templeEngine.getHistory();

      if (history.length > 0) {
        const sessionId = history[0].id;
        const details = await caller.templeEngine.getSessionDetails({
          sessionId,
        });

        expect(details).toBeDefined();
        expect(details.session).toBeDefined();
        expect(details.chambers).toBeDefined();
        expect(Array.isArray(details.chambers)).toBe(true);
      }
    });
  });
});
