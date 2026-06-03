import { publicProcedure, router } from "../_core/trpc";
import { getPersonality, setPersonality } from "../templeEngine.personality";
import { loadPersonalityFromDb, savePersonalityToDb, addProphecy } from "../templeEngine.personalityDb";
import { z } from "zod";

export const personalityRouter = router({
  /**
   * Get current personality metrics
   */
  metrics: publicProcedure.query(async () => {
    try {
      // Try to load from database first
      const dbPersonality = await loadPersonalityFromDb();
      if (dbPersonality) {
        const personality = getPersonality();
        return personality.export_state();
      }

      // Fall back to in-memory personality
      const personality = getPersonality();
      return personality.export_state();
    } catch (error) {
      console.error("[Personality API] Failed to get metrics:", error);
      const personality = getPersonality();
      return personality.export_state();
    }
  }),

  /**
   * Get personality lineage (stories and prophecies)
   */
  lineage: publicProcedure.query(async () => {
    try {
      const dbPersonality = await loadPersonalityFromDb();
      if (dbPersonality) {
        return {
          generation: dbPersonality.generation,
          ghost_stories: dbPersonality.ghost_stories,
          war_stories: dbPersonality.war_stories,
          legends: dbPersonality.legends,
          prophecies: dbPersonality.prophecies,
        };
      }

      const personality = getPersonality();
      const state = personality.export_state();
      return {
        generation: state.generation,
        ghost_stories: state.ghost_stories,
        war_stories: state.war_stories,
        legends: state.legends,
        prophecies: state.prophecies,
      };
    } catch (error) {
      console.error("[Personality API] Failed to get lineage:", error);
      const personality = getPersonality();
      const state = personality.export_state();
      return {
        generation: state.generation,
        ghost_stories: state.ghost_stories,
        war_stories: state.war_stories,
        legends: state.legends,
        prophecies: state.prophecies,
      };
    }
  }),

  /**
   * Add a prophecy (user-provided future intent)
   */
  prophecy: publicProcedure
    .input(z.object({ prophecy: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const personality = getPersonality();
        personality.add_prophecy(input.prophecy);

        // Save to database
        const generation = personality.generation;
        await addProphecy(generation, input.prophecy);
        await savePersonalityToDb(personality);

        return {
          success: true,
          prophecy: input.prophecy,
          generation,
        };
      } catch (error) {
        console.error("[Personality API] Failed to add prophecy:", error);
        return {
          success: false,
          error: "Failed to add prophecy",
        };
      }
    }),

  /**
   * Process input through personality layer
   * Returns whether the Temple should refuse and mood hints
   */
  processInput: publicProcedure
    .input(z.object({ input: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const personality = getPersonality();
        const result = personality.process_input(input.input);

        // Harvest vocabulary
        personality.harvest_vocabulary(input.input);

        // Save updated personality
        await savePersonalityToDb(personality);

        return {
          should_refuse: result.should_refuse,
          response_hint: result.response_hint,
          mood: personality.current_mood,
          entropy: personality.entropy,
          boredom: personality.boredom,
          curiosity: personality.curiosity,
        };
      } catch (error) {
        console.error("[Personality API] Failed to process input:", error);
        return {
          should_refuse: false,
          response_hint: "Processing...",
          mood: "Listening",
          entropy: 0.5,
          boredom: 0.5,
          curiosity: 0.5,
        };
      }
    }),

  /**
   * Explicitly save personality state
   */
  save: publicProcedure.mutation(async () => {
    try {
      const personality = getPersonality();
      const success = await savePersonalityToDb(personality);
      return { success };
    } catch (error) {
      console.error("[Personality API] Failed to save personality:", error);
      return { success: false };
    }
  }),

  /**
   * Reset to new generation
   */
  reset: publicProcedure.mutation(async () => {
    try {
      const personality = getPersonality();
      personality.generation += 1;
      personality.entropy = 0.2;
      personality.boredom = 0.1;
      personality.curiosity = 0.5;
      personality.recent_vocabulary = [];
      personality.apply_cultural_physics();

      await savePersonalityToDb(personality);
      setPersonality(personality);

      return {
        success: true,
        generation: personality.generation,
      };
    } catch (error) {
      console.error("[Personality API] Failed to reset personality:", error);
      return { success: false };
    }
  }),
});
