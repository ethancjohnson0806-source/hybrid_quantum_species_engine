import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function RunViewer() {
  const [match, params] = useRoute('/run/:runId');
  const runId = params?.runId as string;

  const { data: trajectoryData, isLoading: loadingTrajectory } = trpc.quantumRuns.getTrajectory.useQuery(
    { run_id: runId },
    { enabled: !!runId }
  );

  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const { data: bitstringData } = trpc.quantumRuns.getBitStringState.useQuery(
    { run_id: runId, step: selectedStep || 0 },
    { enabled: !!runId && selectedStep !== null }
  );

  if (!match || loadingTrajectory) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  const trajectory = trajectoryData?.trajectory;
  if (!trajectory) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Run not found</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = trajectory.steps.map(step => ({
    step: step.step,
    time: step.time,
    coherence_index: step.coherence_index,
    energy: step.energy,
    xeb_fidelity: step.xeb_fidelity,
    loss: step.loss,
  }));

  // Prepare bitstring data
  const bitstringChartData = bitstringData?.state
    ? Object.entries(bitstringData.state.bitstring_probs).map(([bitstring, prob]) => ({
        bitstring,
        probability: prob,
      }))
    : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Run: {runId}</h1>
        <p className="text-muted-foreground">Quantum computation metrics and analysis</p>
      </div>

      {/* Coherence vs Step */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Coherence Index vs Step</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="coherence_index" stroke="#8b5cf6" name="Coherence Index" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Energy/Loss vs Step */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Energy & Loss vs Step</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData.some(d => d.energy !== null) && (
              <Line type="monotone" dataKey="energy" stroke="#3b82f6" name="Energy" />
            )}
            {chartData.some(d => d.loss !== null) && (
              <Line type="monotone" dataKey="loss" stroke="#ef4444" name="Loss" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* XEB Fidelity vs Step */}
      {chartData.some(d => d.xeb_fidelity !== null) && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">XEB Fidelity vs Step</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="xeb_fidelity" stroke="#10b981" name="XEB Fidelity" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Bitstring Distribution */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Bitstring Distribution</h2>
        <div className="mb-4">
          <label className="text-sm text-muted-foreground">Select Step:</label>
          <select
            value={selectedStep || 0}
            onChange={(e) => setSelectedStep(parseInt(e.target.value))}
            className="mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {trajectory.steps.map(step => (
              <option key={step.step} value={step.step}>
                Step {step.step}
              </option>
            ))}
          </select>
        </div>

        {bitstringChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bitstringChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bitstring" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="probability" fill="#8b5cf6" name="Probability" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8">No bitstring data available for this step</p>
        )}
      </Card>

      {/* Summary Statistics */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Steps</p>
            <p className="text-2xl font-bold text-foreground">{trajectory.steps.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Final Coherence</p>
            <p className="text-2xl font-bold text-foreground">
              {(trajectory.steps[trajectory.steps.length - 1]?.coherence_index * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold text-foreground">
              {trajectory.steps[trajectory.steps.length - 1]?.time.toFixed(2)}s
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Coherence</p>
            <p className="text-2xl font-bold text-foreground">
              {(trajectory.steps.reduce((sum, s) => sum + s.coherence_index, 0) / trajectory.steps.length * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
