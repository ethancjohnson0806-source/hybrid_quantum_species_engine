import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { quantumBridge } from "../quantumBridge";
import { getDb } from "../db";
import { quantumRuns } from "../../drizzle/schema";

/**
 * Quantum Engine API Router
 * Provides tRPC endpoints for quantum algorithm execution
 */

const runVQEProcedure = publicProcedure
  .input(z.object({
    num_qubits: z.number().min(1).max(20).default(4),
    iterations: z.number().min(1).max(1000).default(50),
  }))
  .mutation(async ({ input }) => {
    try {
      const result = await quantumBridge.runVQE(input.num_qubits, input.iterations);
      
      if (result.error) {
        return {
          success: false,
          error: result.error,
          traceback: result.traceback,
        };
      }

      // Store in database
      const db = await getDb();
      if (db) {
        try {
          await db.insert(quantumRuns).values({
            algorithm: 'VQE',
            numQubits: input.num_qubits,
            iterations: input.iterations,
            result: JSON.stringify(result),
            executionTime: result.execution_time || 0,
            status: 'completed',
            createdAt: new Date(),
          });
        } catch (dbError) {
          console.error("Failed to store quantum run:", dbError);
        }
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  });

const runQAOAProcedure = publicProcedure
  .input(z.object({
    num_qubits: z.number().min(1).max(20).default(4),
    iterations: z.number().min(1).max(1000).default(50),
  }))
  .mutation(async ({ input }) => {
    try {
      const result = await quantumBridge.runQAOA(input.num_qubits, input.iterations);
      
      if (result.error) {
        return {
          success: false,
          error: result.error,
          traceback: result.traceback,
        };
      }

      // Store in database
      const db = await getDb();
      if (db) {
        try {
          await db.insert(quantumRuns).values({
            algorithm: 'QAOA',
            numQubits: input.num_qubits,
            iterations: input.iterations,
            result: JSON.stringify(result),
            executionTime: result.execution_time || 0,
            status: 'completed',
            createdAt: new Date(),
          });
        } catch (dbError) {
          console.error("Failed to store quantum run:", dbError);
        }
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  });

const runGroverProcedure = publicProcedure
  .input(z.object({
    num_qubits: z.number().min(1).max(20).default(4),
    marked_indices: z.array(z.number()).default([1, 3]),
  }))
  .mutation(async ({ input }) => {
    try {
      const result = await quantumBridge.runGrover(input.num_qubits, input.marked_indices);
      
      if (result.error) {
        return {
          success: false,
          error: result.error,
          traceback: result.traceback,
        };
      }

      // Store in database
      const db = await getDb();
      if (db) {
        try {
          await db.insert(quantumRuns).values({
            algorithm: 'Grover',
            numQubits: input.num_qubits,
            iterations: input.marked_indices.length,
            result: JSON.stringify(result),
            executionTime: result.execution_time || 0,
            status: 'completed',
            createdAt: new Date(),
          });
        } catch (dbError) {
          console.error("Failed to store quantum run:", dbError);
        }
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  });

const listRunsProcedure = publicProcedure
  .query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
          runs: [],
        };
      }

      const runs = await db.select().from(quantumRuns).limit(100);
      
      return {
        success: true,
        runs: runs.map((run: any) => ({
          id: run.id,
          algorithm: run.algorithm || '',
          numQubits: run.numQubits || 0,
          iterations: run.iterations || 0,
          executionTime: run.executionTime || 0,
          status: run.status || '',
          createdAt: run.createdAt || new Date(),
          result: run.result ? JSON.parse(run.result as string) : null,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        runs: [],
      };
    }
  });

const getRunProcedure = publicProcedure
  .input(z.object({
    run_id: z.number(),
  }))
  .query(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          error: 'Database not available',
        };
      }

      const { eq } = await import('drizzle-orm');
      const run = await db.select().from(quantumRuns).where(eq(quantumRuns.id, input.run_id)).limit(1);
      
      if (!run || run.length === 0) {
        return {
          success: false,
          error: 'Run not found',
        };
      }

      const r = run[0];
      return {
        success: true,
        data: {
          id: r.id,
          algorithm: r.algorithm || '',
          numQubits: r.numQubits || 0,
          iterations: r.iterations || 0,
          executionTime: r.executionTime || 0,
          status: r.status || '',
          createdAt: r.createdAt || new Date(),
          result: r.result ? JSON.parse(r.result as string) : null,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  });

export const quantumRouter = router({
  runVQE: runVQEProcedure,
  runQAOA: runQAOAProcedure,
  runGrover: runGroverProcedure,
  listRuns: listRunsProcedure,
  getRun: getRunProcedure,
});

export type QuantumRouter = typeof quantumRouter;
