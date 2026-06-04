import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Bridge to communicate with the Python Quantum Engine service
 */
export class QuantumBridge {
  private pythonScriptPath: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.pythonScriptPath = path.join(__dirname, 'quantum_service.py');
  }

  /**
   * Execute a quantum command via the Python service
   */
  private async executeCommand(command: string, args: Record<string, any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const python = spawn('python3', [this.pythonScriptPath, command, JSON.stringify(args)]);
        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
          output += data.toString();
        });

        python.stderr.on('data', (data) => {
          error += data.toString();
        });

        python.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Python process exited with code ${code}: ${error}`));
            return;
          }

          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse quantum service output: ${output}`));
          }
        });

        python.on('error', (err) => {
          reject(new Error(`Failed to spawn quantum service: ${err.message}`));
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Run VQE (Variational Quantum Eigensolver) algorithm
   */
  async runVQE(numQubits: number = 4, iterations: number = 50): Promise<any> {
    const cacheKey = `vqe_${numQubits}_${iterations}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.executeCommand('run_vqe', {
      num_qubits: numQubits,
      iterations: iterations,
    });

    if (!result.error) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Run QAOA (Quantum Approximate Optimization Algorithm)
   */
  async runQAOA(numQubits: number = 4, iterations: number = 50): Promise<any> {
    const cacheKey = `qaoa_${numQubits}_${iterations}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.executeCommand('run_qaoa', {
      num_qubits: numQubits,
      iterations: iterations,
    });

    if (!result.error) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Run Grover's search algorithm
   */
  async runGrover(numQubits: number = 4, markedIndices: number[] = [1, 3]): Promise<any> {
    const cacheKey = `grover_${numQubits}_${markedIndices.join('_')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.executeCommand('run_grover', {
      num_qubits: numQubits,
      marked_indices: markedIndices,
    });

    if (!result.error) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get history of all quantum runs
   */
  async getRunHistory(): Promise<any> {
    return this.executeCommand('get_history');
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
let bridgeInstance: QuantumBridge | null = null;

export function getQuantumBridge(): QuantumBridge {
  if (!bridgeInstance) {
    bridgeInstance = new QuantumBridge();
  }
  return bridgeInstance;
}

// For backward compatibility
export const quantumBridge = getQuantumBridge();

  // ===== Temple Quantum v5.0 Methods =====

  async paramsToState(params: number[]): Promise<number[]> {
    return this.executeCommand('params_to_state', { params });
  }

  async buildHamiltonian(
    text: string,
    memoryParams?: number[],
    cloudField?: Record<string, any>
  ): Promise<number[][]> {
    return this.executeCommand('build_hamiltonian', {
      text,
      memory_params: memoryParams,
      cloud_field: cloudField,
    });
  }

  async evolve(H: number[][], iterations?: number): Promise<{
    params: number[];
    energy: number;
    state: number[];
  }> {
    return this.executeCommand('evolve', { H, iterations: iterations || 50 });
  }

  async applyCloudDecoherence(
    params: number[],
    cloudField?: Record<string, any>
  ): Promise<number[]> {
    return this.executeCommand('apply_cloud_decoherence', {
      params,
      cloud_field: cloudField,
    });
  }

  async measureField(state: number[]): Promise<Record<string, number>> {
    return this.executeCommand('measure_field', { state });
  }

  async quantumFidelity(stateA: number[], stateB: number[]): Promise<number> {
    return this.executeCommand('quantum_fidelity', {
      state_a: stateA,
      state_b: stateB,
    });
  }

  async storyResonance(storyText: string, currentState: number[]): Promise<number> {
    return this.executeCommand('story_resonance', {
      story_text: storyText,
      current_state: currentState,
    });
  }

  async textToParams(text: string): Promise<number[]> {
    return this.executeCommand('text_to_params', { text });
  }

  async calculateEntropy(state: number[]): Promise<number> {
    return this.executeCommand('calculate_entropy', { state });
  }
