import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function RunComparison() {
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);
  const [trajectories, setTrajectories] = useState<any[]>([]);
  const { data: runsData, isLoading: loadingRuns } = trpc.quantumRuns.listRuns.useQuery();

  // Fetch trajectories for selected runs
  const fetchTrajectories = async () => {
    const results = [];
    for (const runId of selectedRunIds) {
      const response = await fetch(`/api/trpc/quantumRuns.getTrajectory?input=${JSON.stringify({ run_id: runId })}`);
      const data = await response.json();
      results.push({ runId, trajectory: data.result?.data?.trajectory });
    }
    setTrajectories(results);
  };

  // Use effect to fetch trajectories when selected runs change
  useEffect(() => {
    if (selectedRunIds.length > 0) {
      fetchTrajectories();
    } else {
      setTrajectories([]);
    }
  }, [selectedRunIds]);

  const handleSelectRun = (runId: string) => {
    if (selectedRunIds.includes(runId)) {
      setSelectedRunIds(selectedRunIds.filter(id => id !== runId));
    } else if (selectedRunIds.length < 5) {
      setSelectedRunIds([...selectedRunIds, runId]);
    }
  };

  // Merge trajectories for comparison
  const comparisonData: any[] = [];
  const maxSteps = Math.max(...trajectories.map(t => t.trajectory?.steps.length || 0));

  for (let i = 0; i < maxSteps; i++) {
    const point: any = { step: i };
    trajectories.forEach(({ runId, trajectory }) => {
      if (trajectory && trajectory.steps[i]) {
        point[`${runId}_coherence`] = trajectory.steps[i].coherence_index;
        point[`${runId}_energy`] = trajectory.steps[i].energy;
        point[`${runId}_loss`] = trajectory.steps[i].loss;
      }
    });
    comparisonData.push(point);
  }

  if (loadingRuns) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compare Quantum Runs</h1>
        <p className="text-muted-foreground">Overlay and compare metrics from multiple quantum runs</p>
      </div>

      {/* Run Selection */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Select Runs to Compare</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {runsData?.runs && runsData.runs.length > 0 ? (
            runsData.runs.map((run: any, idx: number) => (
              <label key={run.run_id} className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRunIds.includes(run.run_id)}
                  onChange={() => handleSelectRun(run.run_id)}
                  disabled={!selectedRunIds.includes(run.run_id) && selectedRunIds.length >= 5}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{run.run_id}</p>
                  <p className="text-sm text-muted-foreground">
                    {run.mode} • {run.backend}
                  </p>
                </div>
                {selectedRunIds.includes(run.run_id) && (
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[selectedRunIds.indexOf(run.run_id)] }}
                  />
                )}
              </label>
            ))
          ) : (
            <p className="text-muted-foreground">No runs available</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {selectedRunIds.length}/5 runs selected
        </p>
      </Card>

      {selectedRunIds.length > 0 && (
        <>
          {/* Coherence Comparison */}
          <Card className="p-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Coherence Index Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                {selectedRunIds.map((runId, idx) => (
                  <Line
                    key={runId}
                    type="monotone"
                    dataKey={`${runId}_coherence`}
                    stroke={COLORS[idx]}
                    name={runId.substring(0, 12)}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Energy Comparison */}
          {comparisonData.some(d => Object.values(d).some(v => typeof v === 'number' && v !== d.step)) && (
            <Card className="p-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Energy Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedRunIds.map((runId, idx) => (
                    <Line
                      key={runId}
                      type="monotone"
                      dataKey={`${runId}_energy`}
                      stroke={COLORS[idx]}
                      name={`${runId.substring(0, 12)} Energy`}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Loss Comparison */}
          {comparisonData.some(d => Object.keys(d).some(k => k.includes('_loss'))) && (
            <Card className="p-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Loss Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedRunIds.map((runId, idx) => (
                    <Line
                      key={runId}
                      type="monotone"
                      dataKey={`${runId}_loss`}
                      stroke={COLORS[idx]}
                      name={`${runId.substring(0, 12)} Loss`}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
