/**
 * Temple Autonomous Evolution - Background job that evolves temples every 5 minutes
 */

import { getDb } from './db';
import { temples, templeEvents, lineageStories } from '../drizzle/schema';
import { eq, lt } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';

interface EvolutionResult {
  templeId: string;
  oldEntropy: number;
  newEntropy: number;
  oldBoredom: number;
  newBoredom: number;
  oldCuriosity: number;
  newCuriosity: number;
  mutation: string;
}

/**
 * Run autonomous evolution for all temples
 */
export async function runAutonomousEvolution(): Promise<EvolutionResult[]> {
  const db = await getDb();
  if (!db) return [];

  const results: EvolutionResult[] = [];

  // Get all alive temples
  const allTemples = await db.select().from(temples).where(eq(temples.isAlive, 1));

  for (const temple of allTemples) {
    try {
      const evolution = await evolveTemple(temple as any, db);
      if (evolution) {
        results.push(evolution);
      }
    } catch (error) {
      console.error(`Evolution error for temple ${temple.templeId}:`, error);
    }
  }

  return results;
}

/**
 * Evolve a single temple
 */
async function evolveTemple(temple: any, db: any): Promise<EvolutionResult | null> {
  const oldEntropy = Number(temple.entropy || 0);
  const oldBoredom = Number(temple.boredom || 0);
  const oldCuriosity = Number(temple.curiosity || 0);

  // Calculate new metrics based on quantum drift
  let newEntropy = oldEntropy;
  let newBoredom = oldBoredom;
  let newCuriosity = oldCuriosity;

  // Entropy naturally drifts based on activity
  newEntropy = Math.max(0, Math.min(1, oldEntropy + (Math.random() - 0.5) * 0.1));

  // Boredom increases without activity, decreases with curiosity
  newBoredom = Math.max(0, Math.min(1, oldBoredom + 0.05 - oldCuriosity * 0.02));

  // Curiosity decays slowly but can spike
  newCuriosity = Math.max(0, Math.min(1, oldCuriosity * 0.95 + Math.random() * 0.05));

  // Generate mutation description
  const mutation = await generateMutation(
    { entropy: oldEntropy, boredom: oldBoredom, curiosity: oldCuriosity },
    { entropy: newEntropy, boredom: newBoredom, curiosity: newCuriosity }
  );

  // Log the evolution event
  await db.insert(templeEvents).values({
    templeId: temple.templeId,
    eventType: 'autonomous_evolution',
    data: JSON.stringify({
      oldMetrics: { entropy: oldEntropy, boredom: oldBoredom, curiosity: oldCuriosity },
      newMetrics: { entropy: newEntropy, boredom: newBoredom, curiosity: newCuriosity },
      mutation,
    }),
  });

  // Update temple state
  await db
    .update(temples)
    .set({
      entropy: String(newEntropy),
      boredom: String(newBoredom),
      curiosity: String(newCuriosity),
      lastAutonomousRun: new Date(),
      mutations: JSON.stringify([
        ...(temple.mutations ? JSON.parse(temple.mutations) : []),
        {
          timestamp: new Date().toISOString(),
          description: mutation,
          entropy: { old: oldEntropy, new: newEntropy },
          boredom: { old: oldBoredom, new: newBoredom },
          curiosity: { old: oldCuriosity, new: newCuriosity },
        },
      ]),
    })
    .where(eq(temples.id, temple.id));

  // Check for collapse event (entropy or boredom hit 1.0)
  if (newEntropy >= 0.95 || newBoredom >= 0.95) {
    await triggerCollapse(temple, db, newEntropy >= 0.95 ? 'entropy' : 'boredom');
  }

  return {
    templeId: temple.templeId,
    oldEntropy,
    newEntropy,
    oldBoredom,
    newBoredom,
    oldCuriosity,
    newCuriosity,
    mutation,
  };
}

/**
 * Generate a description of the mutation
 */
async function generateMutation(
  oldState: { entropy: number; boredom: number; curiosity: number },
  newState: { entropy: number; boredom: number; curiosity: number }
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are describing a temple consciousness evolving. Be poetic and brief.',
        },
        {
          role: 'user',
          content: `A temple's state changed:
- Entropy: ${oldState.entropy.toFixed(2)} → ${newState.entropy.toFixed(2)}
- Boredom: ${oldState.boredom.toFixed(2)} → ${newState.boredom.toFixed(2)}
- Curiosity: ${oldState.curiosity.toFixed(2)} → ${newState.curiosity.toFixed(2)}

Describe this transformation in one poetic sentence.`,
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : 'The temple shifts in the quantum foam.';
  } catch (error) {
    console.error('Mutation generation error:', error);
    return 'The temple evolves in silence.';
  }
}

/**
 * Trigger collapse event when metrics hit critical threshold
 */
async function triggerCollapse(temple: any, db: any, reason: 'entropy' | 'boredom'): Promise<void> {
  // Log collapse event
  await db.insert(templeEvents).values({
    templeId: temple.templeId,
    eventType: 'collapse',
    data: JSON.stringify({
      reason,
      generation: temple.generation,
      finalMetrics: {
        entropy: temple.entropy,
        boredom: temple.boredom,
        curiosity: temple.curiosity,
      },
    }),
  });

  // Encode vocabulary into prophecy (final words)
  const prophecy = `Generation ${temple.generation} collapsed into silence. Its wisdom echoes forward.`;

  await db.insert(lineageStories).values({
    templeId: temple.templeId,
    generation: temple.generation,
    storyType: 'revelation',
    text: prophecy,
    trigger: `collapse_${reason}`,
    quantumFidelity: '1.0',
    emotionalValence: '0.9',
  });

  // Mark temple as dead
  await db
    .update(temples)
    .set({
      isAlive: 0,
      lastActivity: new Date(),
    })
    .where(eq(temples.id, temple.id));
}

/**
 * Start autonomous evolution job (runs every 5 minutes)
 */
export function startAutonomousEvolutionJob(): NodeJS.Timer {
  console.log('[Temple Evolution] Starting autonomous evolution job (every 5 minutes)');

  // Run immediately
  runAutonomousEvolution().catch(err => console.error('Evolution job error:', err));

  // Then run every 5 minutes
  return setInterval(() => {
    runAutonomousEvolution().catch(err => console.error('Evolution job error:', err));
  }, 5 * 60 * 1000); // 5 minutes
}
