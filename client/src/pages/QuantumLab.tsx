import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function QuantumLab() {
  const [numQubits, setNumQubits] = useState(4);
  const [iterations, setIterations] = useState(50);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'VQE' | 'QAOA' | 'Grover'>('VQE');
  const [activeRun, setActiveRun] = useState<any>(null);

  const { data: runs, isLoading: loadingRuns, refetch } = trpc.quantum.listRuns.useQuery();

  const vqeMutation = trpc.quantum.runVQE.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setActiveRun(data.data);
        refetch();
      }
    },
  });

  const qaoaMutation = trpc.quantum.runQAOA.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setActiveRun(data.data);
        refetch();
      }
    },
  });

  const groverMutation = trpc.quantum.runGrover.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setActiveRun(data.data);
        refetch();
      }
    },
  });

  const handleRunAlgorithm = () => {
    if (selectedAlgorithm === 'VQE') {
      vqeMutation.mutate({ num_qubits: numQubits, iterations });
    } else if (selectedAlgorithm === 'QAOA') {
      qaoaMutation.mutate({ num_qubits: numQubits, iterations });
    } else {
      groverMutation.mutate({ num_qubits: numQubits, marked_indices: [1, 3] });
    }
  };

  const isRunning = vqeMutation.isPending || qaoaMutation.isPending || groverMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Quantum Lab</h1>
        <p className="text-muted-foreground">Execute quantum algorithms and visualize results</p>
      </div>

      {/* Algorithm Selection */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Algorithm Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Select Algorithm</label>
            <div className="flex gap-2 mt-2">
              {['VQE', 'QAOA', 'Grover'].map(algo => (
                <Button
                  key={algo}
                  variant={selectedAlgorithm === algo ? 'default' : 'outline'}
                  onClick={() => setSelectedAlgorithm(algo as any)}
                >
                  {algo}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Number of Qubits</label>
              <input
                type="range"
                min="1"
                max="20"
                value={numQubits}
                onChange={(e) => setNumQubits(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-sm font-medium text-foreground mt-1">{numQubits} qubits</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Iterations</label>
              <input
                type="range"
                min="1"
                max="200"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-sm font-medium text-foreground mt-1">{iterations} iterations</p>
            </div>
          </div>

          <Button
            onClick={handleRunAlgorithm}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Running {selectedAlgorithm}...
              </>
            ) : (
              `Run ${selectedAlgorithm}`
            )}
          </Button>
        </div>
      </Card>

      {/* Active Run Results */}
      {activeRun && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Latest Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Algorithm</p>
              <p className="text-2xl font-bold text-foreground">{activeRun.algorithm}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qubits</p>
              <p className="text-2xl font-bold text-foreground">{activeRun.num_qubits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Execution Time</p>
              <p className="text-2xl font-bold text-foreground">{activeRun.execution_time?.toFixed(3)}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-green-500">{activeRun.status}</p>
            </div>
          </div>

          {/* Results based on algorithm */}
          {activeRun.algorithm === 'VQE' && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Optimal Energy</p>
              <p className="text-3xl font-bold text-foreground">{activeRun.optimal_energy?.toFixed(6)}</p>
            </div>
          )}

          {activeRun.algorithm === 'QAOA' && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Optimal Cost</p>
              <p className="text-3xl font-bold text-foreground">{activeRun.optimal_cost?.toFixed(6)}</p>
            </div>
          )}

          {activeRun.algorithm === 'Grover' && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Success Probability</p>
              <p className="text-3xl font-bold text-foreground">{(activeRun.success_probability * 100).toFixed(1)}%</p>
            </div>
          )}

          {/* Convergence History Chart */}
          {activeRun.convergence_history && activeRun.convergence_history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Convergence History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activeRun.convergence_history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" name="Cost/Energy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      {/* Run History */}
      {runs && runs.success && runs.runs && runs.runs.length > 0 && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Run History</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {runs.runs.map((run: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setActiveRun(run.result)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{run.algorithm}</p>
                    <p className="text-sm text-muted-foreground">
                      {run.numQubits} qubits • {run.iterations} iterations • {run.executionTime?.toFixed(3)}s
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loadingRuns && (
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      )}
    </div>
  );
}
