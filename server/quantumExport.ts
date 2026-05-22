import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'templevisu_data', 'runs');

// Ensure directory structure exists
async function ensureDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

export interface RunConfig {
  [key: string]: any;
}

export interface StepData {
  step: number;
  time: number;
  coherence_index: number;
  energy?: number | null;
  xeb_fidelity?: number | null;
  loss?: number | null;
  extra?: Record<string, any>;
}

export interface RunMetadata {
  run_id: string;
  mode: 'VQE' | 'ANNEAL' | 'XEB' | 'SIM' | 'HARDWARE';
  backend: string;
  description: string;
  created_at: string;
  config: RunConfig;
}

export interface TrajectoryData {
  run_id: string;
  steps: StepData[];
}

export interface BitStringState {
  run_id: string;
  step: number;
  bitstring_probs: Record<string, number>;
}

class QuantumExport {
  private activeRuns: Map<string, TrajectoryData> = new Map();

  /**
   * Start a new quantum run
   */
  async startRun(
    mode: 'VQE' | 'ANNEAL' | 'XEB' | 'SIM' | 'HARDWARE',
    backend: string,
    description: string,
    config: RunConfig
  ): Promise<string> {
    await ensureDirectory();

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize trajectory
    this.activeRuns.set(runId, {
      run_id: runId,
      steps: [],
    });

    // Save run metadata
    const metadata: RunMetadata = {
      run_id: runId,
      mode,
      backend,
      description,
      created_at: new Date().toISOString(),
      config,
    };

    const runFile = path.join(DATA_DIR, `${runId}.run.json`);
    await fs.writeFile(runFile, JSON.stringify(metadata, null, 2));

    console.log(`[QuantumExport] Started run: ${runId}`);
    return runId;
  }

  /**
   * Log a step in the quantum run
   */
  async logStep(runId: string, stepData: StepData): Promise<void> {
    const trajectory = this.activeRuns.get(runId);
    if (!trajectory) {
      throw new Error(`Run ${runId} not found`);
    }

    trajectory.steps.push(stepData);
  }

  /**
   * Save the quantum run to disk
   */
  async saveRun(runId: string, bitstringStates?: BitStringState[]): Promise<void> {
    const trajectory = this.activeRuns.get(runId);
    if (!trajectory) {
      throw new Error(`Run ${runId} not found`);
    }

    await ensureDirectory();

    // Save trajectory
    const trajectoryFile = path.join(DATA_DIR, `${runId}.trajectory.json`);
    await fs.writeFile(trajectoryFile, JSON.stringify(trajectory, null, 2));

    // Save optional bitstring states
    if (bitstringStates && bitstringStates.length > 0) {
      for (const state of bitstringStates) {
        const stateFile = path.join(DATA_DIR, `${runId}.state${state.step}.json`);
        await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
      }
    }

    // Clean up from memory
    this.activeRuns.delete(runId);

    console.log(`[QuantumExport] Saved run: ${runId}`);
  }

  /**
   * List all available runs
   */
  async listRuns(): Promise<RunMetadata[]> {
    await ensureDirectory();

    try {
      const files = await fs.readdir(DATA_DIR);
      const runFiles = files.filter(f => f.endsWith('.run.json'));

      const runs: RunMetadata[] = [];
      for (const file of runFiles) {
        const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
        runs.push(JSON.parse(content));
      }

      return runs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Failed to list runs:', error);
      return [];
    }
  }

  /**
   * Get a specific run's trajectory
   */
  async getTrajectory(runId: string): Promise<TrajectoryData | null> {
    await ensureDirectory();

    try {
      const trajectoryFile = path.join(DATA_DIR, `${runId}.trajectory.json`);
      const content = await fs.readFile(trajectoryFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to read trajectory for run ${runId}:`, error);
      return null;
    }
  }

  /**
   * Get bitstring state for a specific step
   */
  async getBitStringState(runId: string, step: number): Promise<BitStringState | null> {
    await ensureDirectory();

    try {
      const stateFile = path.join(DATA_DIR, `${runId}.state${step}.json`);
      const content = await fs.readFile(stateFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // State file may not exist
      return null;
    }
  }

  /**
   * Delete a run
   */
  async deleteRun(runId: string): Promise<void> {
    await ensureDirectory();

    try {
      const files = await fs.readdir(DATA_DIR);
      const runFiles = files.filter(f => f.startsWith(runId));

      for (const file of runFiles) {
        await fs.unlink(path.join(DATA_DIR, file));
      }

      this.activeRuns.delete(runId);
      console.log(`[QuantumExport] Deleted run: ${runId}`);
    } catch (error) {
      console.error(`Failed to delete run ${runId}:`, error);
    }
  }
}

export const quantumExport = new QuantumExport();
