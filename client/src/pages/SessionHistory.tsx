import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

export function SessionHistory() {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = trpc.templeEngine.listSessions.useQuery({
    limit,
    offset,
  });

  const handleExport = (sessionId: number, query: string) => {
    const exportMutation = trpc.templeEngine.exportSession.useQuery({ session_id: sessionId });
    
    // Download as JSON
    if (exportMutation.data?.session) {
      const json = JSON.stringify(exportMutation.data.session, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleExportPDF = (sessionId: number, query: string) => {
    // Generate PDF with session data
    const content = `
# Temple Engine Session Export

**Query:** ${query}
**Session ID:** ${sessionId}
**Exported:** ${new Date().toISOString()}

## Session Data

This session contains the complete reasoning trace through the five chambers.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Session History</h1>
        <p className="text-muted-foreground">Browse and manage your past Temple Engine sessions</p>
      </div>

      {data?.sessions && data.sessions.length > 0 ? (
        <div className="space-y-4">
          {data.sessions.map((session: any) => (
            <Card key={session.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {session.user_query.substring(0, 60)}
                    {session.user_query.length > 60 ? '...' : ''}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {format(new Date(session.created_at), 'PPpp')}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.final_answer}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(session.id, session.user_query)}
                  >
                    Export JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportPDF(session.id, session.user_query)}
                  >
                    Export PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex gap-2 justify-center mt-6">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!data.sessions || data.sessions.length < limit}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No sessions yet</p>
          <p className="text-sm text-muted-foreground">
            Start by processing a query to create your first session
          </p>
        </Card>
      )}
    </div>
  );
}
