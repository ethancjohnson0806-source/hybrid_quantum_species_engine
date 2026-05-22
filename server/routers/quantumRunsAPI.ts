import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { quantumExport } from "../quantumExport";

/**
 * List all quantum runs
 */
const listRunsProcedure = publicProcedure
  .query(async () => {
    try {
      const runs = await quantumExport.listRuns();
      return {
        runs: runs.map(r => ({
          run_id: r.run_id,
          mode: r.mode,
          backend: r.backend,
          description: r.description,
          created_at: r.created_at,
        })),
      };
    } catch (error) {
      console.error('Error listing runs:', error);
      throw new Error(`Failed to list runs: ${(error as any).message}`);
    }
  });

/**
 * Get trajectory for a specific run
 */
const getTrajectoryProcedure = publicProcedure
  .input(z.object({
    run_id: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const trajectory = await quantumExport.getTrajectory(input.run_id);
      if (!trajectory) {
        throw new Error(`Trajectory not found for run ${input.run_id}`);
      }
      return { trajectory };
    } catch (error) {
      console.error('Error getting trajectory:', error);
      throw new Error(`Failed to get trajectory: ${(error as any).message}`);
    }
  });

/**
 * Get bitstring state for a specific step
 */
const getBitStringStateProcedure = publicProcedure
  .input(z.object({
    run_id: z.string(),
    step: z.number(),
  }))
  .query(async ({ input }) => {
    try {
      const state = await quantumExport.getBitStringState(input.run_id, input.step);
      return { state };
    } catch (error) {
      console.error('Error getting bitstring state:', error);
      throw new Error(`Failed to get bitstring state: ${(error as any).message}`);
    }
  });

/**
 * Start a new quantum run
 */
const startRunProcedure = publicProcedure
  .input(z.object({
    mode: z.enum(['VQE', 'ANNEAL', 'XEB', 'SIM', 'HARDWARE']),
    backend: z.string(),
    description: z.string(),
    config: z.record(z.any()).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const runId = await quantumExport.startRun(
        input.mode,
        input.backend,
        input.description,
        input.config || {}
      );
      return { run_id: runId };
    } catch (error) {
      console.error('Error starting run:', error);
      throw new Error(`Failed to start run: ${(error as any).message}`);
    }
  });

/**
 * Log a step in a quantum run
 */
const logStepProcedure = publicProcedure
  .input(z.object({
    run_id: z.string(),
    step: z.number(),
    time: z.number(),
    coherence_index: z.number(),
    energy: z.number().optional(),
    xeb_fidelity: z.number().optional(),
    loss: z.number().optional(),
    extra: z.record(z.any()).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      await quantumExport.logStep(input.run_id, {
        step: input.step,
        time: input.time,
        coherence_index: input.coherence_index,
        energy: input.energy || null,
        xeb_fidelity: input.xeb_fidelity || null,
        loss: input.loss || null,
        extra: input.extra,
      });
      return { status: 'ok' };
    } catch (error) {
      console.error('Error logging step:', error);
      throw new Error(`Failed to log step: ${(error as any).message}`);
    }
  });

/**
 * Save a quantum run
 */
const saveRunProcedure = publicProcedure
  .input(z.object({
    run_id: z.string(),
    bitstring_states: z.array(z.object({
      step: z.number(),
      bitstring_probs: z.record(z.number()),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const bitstringStates = input.bitstring_states?.map(s => ({
        run_id: input.run_id,
        step: s.step,
        bitstring_probs: s.bitstring_probs,
      }));

      await quantumExport.saveRun(input.run_id, bitstringStates);
      return { status: 'saved' };
    } catch (error) {
      console.error('Error saving run:', error);
      throw new Error(`Failed to save run: ${(error as any).message}`);
    }
  });

/**
 * Delete a quantum run
 */
const deleteRunProcedure = publicProcedure
  .input(z.object({
    run_id: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      await quantumExport.deleteRun(input.run_id);
      return { status: 'deleted' };
    } catch (error) {
      console.error('Error deleting run:', error);
      throw new Error(`Failed to delete run: ${(error as any).message}`);
    }
  });

export const quantumRunsRouter = router({
  listRuns: listRunsProcedure,
  getTrajectory: getTrajectoryProcedure,
  getBitStringState: getBitStringStateProcedure,
  startRun: startRunProcedure,
  logStep: logStepProcedure,
  saveRun: saveRunProcedure,
  deleteRun: deleteRunProcedure,
});
