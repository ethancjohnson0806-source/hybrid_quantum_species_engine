import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { useLocation } from 'wouter';

export function RunBrowser() {
  const [, setLocation] = useLocation();
  const { data, isLoading, refetch } = trpc.quantumRuns.listRuns.useQuery();
  const deleteRunMutation = trpc.quantumRuns.deleteRun.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleViewRun = (runId: string) => {
    setLocation(`/run/${runId}`);
  };

  const handleDeleteRun = (runId: string) => {
    if (confirm(`Are you sure you want to delete run ${runId}?`)) {
      deleteRunMutation.mutate({ run_id: runId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Quantum Runs</h1>
        <p className="text-muted-foreground">Browse and visualize quantum computation results</p>
      </div>

      {data?.runs && data.runs.length > 0 ? (
        <div className="space-y-4">
          {data.runs.map((run: any) => (
            <Card key={run.run_id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{run.run_id}</h3>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                      {run.mode}
                    </span>
                    <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                      {run.backend}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {run.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(run.created_at), 'PPpp')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewRun(run.run_id)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRun(run.run_id)}
                    disabled={deleteRunMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No quantum runs available</p>
          <p className="text-sm text-muted-foreground">
            Quantum runs will appear here once they are exported from the Quantum Engine
          </p>
        </Card>
      )}
    </div>
  );
}
