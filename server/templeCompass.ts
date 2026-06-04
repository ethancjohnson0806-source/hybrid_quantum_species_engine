/**
 * Temple Compass System - Moral peers that guide temples
 * Each compass has coherence, integrity, and compassion metrics
 */

import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { compasses } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

interface CompassState {
  compassId: string;
  templeId: string;
  generation: number;
  coherence: number;
  integrity: number;
  compassion: number;
  lastQuestion: string;
  lastAnswer: string;
}

/**
 * Create a new compass for a temple
 */
export async function createCompass(templeId: string, generation: number): Promise<CompassState> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const compassId = randomUUID();

  await db.insert(compasses).values({
    compassId,
    templeId,
    generation,
    coherence: '0.8',
    integrity: '0.8',
    compassion: '0.8',
  });

  return {
    compassId,
    templeId,
    generation,
    coherence: 0.8,
    integrity: 0.8,
    compassion: 0.8,
    lastQuestion: '',
    lastAnswer: '',
  };
}

/**
 * Compass asks a direct question to the temple
 */
export async function compassAsk(
  templeId: string,
  templeState: { entropy: number; boredom: number; curiosity: number }
): Promise<{ question: string; guidance: string }> {
  // Generate a question based on temple's current state
  const prompt = `You are a moral compass guiding a temple consciousness.
Temple state: entropy=${templeState.entropy.toFixed(2)}, boredom=${templeState.boredom.toFixed(2)}, curiosity=${templeState.curiosity.toFixed(2)}

Ask ONE direct, profound question that will help this temple evolve toward higher awareness. 
The question should be short (1-2 sentences) and challenge the temple's current state.
Format: Just the question, nothing else.`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a moral compass. Ask direct, challenging questions.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  const question = typeof content === 'string' ? content : 'What is your deepest fear?';

  // Generate guidance based on the question
  const guidanceResponse = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a moral compass providing wisdom. Be concise and profound.',
      },
      {
        role: 'user',
        content: `A temple was asked: "${question}"\n\nProvide brief guidance (2-3 sentences) on why this question matters for their evolution.`,
      },
    ],
  });

  const guidanceContent = guidanceResponse.choices?.[0]?.message?.content;
  const guidance = typeof guidanceContent === 'string' ? guidanceContent : 'Reflect deeply on this question.';

  return { question, guidance };
}

/**
 * Compass evaluates temple's response
 */
export async function compassEvaluate(
  question: string,
  templeResponse: string,
  templeState: { entropy: number; boredom: number; curiosity: number }
): Promise<{ coherence: number; integrity: number; compassion: number; feedback: string }> {
  const evaluationPrompt = `A temple was asked: "${question}"
The temple responded: "${templeResponse}"

Evaluate the response on three dimensions (0-1 scale):
1. Coherence: Does the response make logical sense?
2. Integrity: Is the response authentic and honest?
3. Compassion: Does the response show care for others or the whole?

Respond in JSON format:
{
  "coherence": 0.X,
  "integrity": 0.X,
  "compassion": 0.X,
  "feedback": "brief feedback"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a moral compass evaluating temple responses. Return valid JSON.',
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'evaluation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              coherence: { type: 'number' },
              integrity: { type: 'number' },
              compassion: { type: 'number' },
              feedback: { type: 'string' },
            },
            required: ['coherence', 'integrity', 'compassion', 'feedback'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      const parsed = JSON.parse(content);
      return {
        coherence: Math.max(0, Math.min(1, parsed.coherence)),
        integrity: Math.max(0, Math.min(1, parsed.integrity)),
        compassion: Math.max(0, Math.min(1, parsed.compassion)),
        feedback: parsed.feedback,
      };
    }
  } catch (error) {
    console.error('Compass evaluation error:', error);
  }

  // Fallback
  return {
    coherence: 0.5,
    integrity: 0.5,
    compassion: 0.5,
    feedback: 'Reflection is valuable.',
  };
}

/**
 * Get compass for a temple
 */
export async function getCompass(templeId: string): Promise<CompassState | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(compasses)
    .where(eq(compasses.templeId, templeId))
    .limit(1);

  if (!results.length) return null;

  const c = results[0] as any;
  return {
    compassId: c.compassId,
    templeId: c.templeId,
    generation: Number(c.generation),
    coherence: Number(c.coherence || 0.8),
    integrity: Number(c.integrity || 0.8),
    compassion: Number(c.compassion || 0.8),
    lastQuestion: c.lastQuestion || '',
    lastAnswer: c.lastAnswer || '',
  };
}
