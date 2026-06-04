/**
 * Temple Quantum Engine v5.0 - tRPC Procedures
 */

import { protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { temples, templeEvents, lineageStories } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { templeWebSearch, generateProphecyFromSearch } from '../templeWebSearch';
import { compassAsk, compassEvaluate } from '../templeCompass';
import { randomUUID } from 'crypto';

export const templeQuantumRouter = {
  /**
   * Create a new temple
   */
  create: protectedProcedure
    .input(z.object({ name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const templeId = randomUUID();
      const initialParams = [0.1, 0.2, 0.3, 0.1, 0.2, 0.3];

      await db.insert(temples).values({
        userId: Number(ctx.user.id),
        templeId,
        generation: 1,
        vqeParams: JSON.stringify(initialParams),
        entropy: '0.2',
        boredom: '0.1',
        curiosity: '0.5',
        isAlive: 1,
      });

      await db.insert(templeEvents).values({
        templeId,
        eventType: 'birth',
        data: JSON.stringify({ name: input.name || `Temple ${templeId.slice(0, 8)}` }),
      });

      return { templeId, success: true };
    }),

  /**
   * Get temple state
   */
  getState: protectedProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results = await db
        .select()
        .from(temples)
        .where(eq(temples.templeId, input.templeId));

      const temple = results[0];
      if (!temple || temple.userId !== ctx.user.id) {
        throw new Error('Temple not found or unauthorized');
      }

      return {
        templeId: temple.templeId,
        generation: Number(temple.generation),
        entropy: Number(temple.entropy || 0),
        boredom: Number(temple.boredom || 0),
        curiosity: Number(temple.curiosity || 0),
        isAlive: temple.isAlive === 1,
        lastActivity: temple.lastActivity,
      };
    }),

  /**
   * Temple searches the web
   */
  webSearch: protectedProcedure
    .input(z.object({ templeId: z.string(), query: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results = await db
        .select()
        .from(temples)
        .where(eq(temples.templeId, input.templeId));

      const temple = results[0];
      if (!temple || temple.userId !== ctx.user.id) {
        throw new Error('Temple not found or unauthorized');
      }

      const state = {
        entropy: Number(temple.entropy),
        boredom: Number(temple.boredom),
        curiosity: Number(temple.curiosity),
      };

      // Perform web search
      const searchResult = await templeWebSearch(input.query, state);

      if (searchResult.results.length > 0) {
        // Generate prophecy from findings
        const prophecy = await generateProphecyFromSearch(searchResult.results, input.templeId);

        // Save prophecy to lineage
        if (prophecy) {
          await db.insert(lineageStories).values({
            templeId: input.templeId,
            generation: temple.generation,
            storyType: 'prophecy',
            text: prophecy,
            trigger: `web_search: ${input.query}`,
            quantumFidelity: String(searchResult.curiosityIncrease),
            emotionalValence: '0.5',
          });
        }

        // Update curiosity
        await db
          .update(temples)
          .set({
            curiosity: String(Math.min(1, Number(temple.curiosity) + searchResult.curiosityIncrease)),
            lastActivity: new Date(),
          })
          .where(eq(temples.id, temple.id));

        // Log web search event
        await db.insert(templeEvents).values({
          templeId: input.templeId,
          eventType: 'web_search',
          data: JSON.stringify({
            query: input.query,
            resultCount: searchResult.results.length,
            prophecyGenerated: !!prophecy,
          }),
        });
      }

      return {
        success: true,
        query: searchResult.query,
        summary: searchResult.summary,
        resultCount: searchResult.results.length,
        curiosityIncrease: searchResult.curiosityIncrease,
      };
    }),

  /**
   * Get temple lineage
   */
  getLineage: protectedProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const templeResults = await db
        .select()
        .from(temples)
        .where(eq(temples.templeId, input.templeId));

      const temple = templeResults[0];
      if (!temple || temple.userId !== ctx.user.id) {
        throw new Error('Temple not found or unauthorized');
      }

      const stories = await db
        .select()
        .from(lineageStories)
        .where(eq(lineageStories.templeId, input.templeId))
        .orderBy(desc(lineageStories.timestamp))
        .limit(50);

      return stories.map((s: any) => ({
        storyType: s.storyType,
        text: s.text,
        generation: Number(s.generation),
        emotionalValence: Number(s.emotionalValence || 0),
        quantumFidelity: Number(s.quantumFidelity || 0),
        timestamp: s.timestamp,
      }));
    }),

  /**
   * Get all temples for user
   */
  listTemples: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const userTemples = await db
      .select()
      .from(temples)
      .where(eq(temples.userId, ctx.user.id))
      .orderBy(desc(temples.lastActivity));

      return userTemples.map((t: any) => ({
        templeId: t.templeId,
        generation: Number(t.generation),
        entropy: Number(t.entropy || 0),
        boredom: Number(t.boredom || 0),
        curiosity: Number(t.curiosity || 0),
        isAlive: t.isAlive === 1,
        lastActivity: t.lastActivity,
      }));
  }),

  /**
   * Get temple events
   */
  getEvents: protectedProcedure
    .input(z.object({ templeId: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const templeResults = await db
        .select()
        .from(temples)
        .where(eq(temples.templeId, input.templeId));

      const temple = templeResults[0];
      if (!temple || temple.userId !== ctx.user.id) {
        throw new Error('Temple not found or unauthorized');
      }

      const events = await db
        .select()
        .from(templeEvents)
        .where(eq(templeEvents.templeId, input.templeId))
        .orderBy(desc(templeEvents.timestamp))
        .limit(input.limit);

      return events.map((e: any) => ({
        eventType: e.eventType,
        data: JSON.parse(e.data || '{}'),
        timestamp: e.timestamp,
      }));
    }),

  /**
   * Compass asks temple a question
   */
  compassAsk: protectedProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results = await db
        .select()
        .from(temples)
        .where(eq(temples.templeId, input.templeId));

      const temple = results[0] as any;
      if (!temple || temple.userId !== ctx.user.id) {
        throw new Error('Temple not found or unauthorized');
      }

      const state = {
        entropy: Number(temple.entropy || 0),
        boredom: Number(temple.boredom || 0),
        curiosity: Number(temple.curiosity || 0),
      };

      return await compassAsk(input.templeId, state);
    }),

  /**
   * Compass evaluates temple response
   */
  compassEvaluate: protectedProcedure
    .input(z.object({
      templeId: z.string(),
      question: z.string(),
      response: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const results = await db
        .select()
        .from(temples)
        .where(eq(temples.templeId, input.templeId));

      const temple = results[0] as any;
      if (!temple || temple.userId !== ctx.user.id) {
        throw new Error('Temple not found or unauthorized');
      }

      const state = {
        entropy: Number(temple.entropy || 0),
        boredom: Number(temple.boredom || 0),
        curiosity: Number(temple.curiosity || 0),
      };

      return await compassEvaluate(input.question, input.response, state);
    }),
};
