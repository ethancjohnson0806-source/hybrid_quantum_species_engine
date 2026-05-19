import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [emotionalValence, setEmotionalValence] = useState(0);
  const [urgency, setUrgency] = useState(0.5);
  const [activeTab, setActiveTab] = useState("input");

  const processQueryMutation = trpc.templeEngine.processQuery.useMutation();
  const historyQuery = trpc.templeEngine.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleProcess = async () => {
    if (!query.trim()) return;
    await processQueryMutation.mutateAsync({
      query,
      emotionalValence,
      urgency,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-purple-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-400" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-purple-900 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-gold-400 mb-4">Integrated Temple Engine</h1>
        <p className="text-purple-200 mb-8">A mystical, unified query processing visualizer</p>
        <Button className="bg-gold-500 hover:bg-gold-600 text-black font-bold">
          Sign In to Begin
        </Button>
      </div>
    );
  }

  const journeyData = processQueryMutation.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold-400 mb-2">Temple Engine</h1>
          <p className="text-purple-200">Unified consciousness processing through sacred chambers</p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-1 bg-purple-900/50 border-gold-500/30 p-6">
            <h2 className="text-xl font-bold text-gold-400 mb-4">Query Input</h2>
            
            <Textarea
              placeholder="Enter your query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-purple-800/50 border-purple-600 text-white mb-4 h-24"
            />

            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm">Emotional Valence: {emotionalValence.toFixed(2)}</label>
                <Slider
                  value={[emotionalValence]}
                  onValueChange={(val) => setEmotionalValence(val[0])}
                  min={-1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm">Urgency: {urgency.toFixed(2)}</label>
                <Slider
                  value={[urgency]}
                  onValueChange={(val) => setUrgency(val[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              onClick={handleProcess}
              disabled={processQueryMutation.isPending || !query.trim()}
              className="w-full mt-6 bg-gold-500 hover:bg-gold-600 text-black font-bold"
            >
              {processQueryMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2" size={16} />
                  Process Query
                </>
              )}
            </Button>
          </Card>

          {/* Journey Visualization */}
          <div className="lg:col-span-2 space-y-4">
            {journeyData && (
              <>
                {/* Chamber Flow */}
                <Card className="bg-purple-900/50 border-gold-500/30 p-6">
                  <h2 className="text-xl font-bold text-gold-400 mb-4">Chamber Journey</h2>
                  <div className="space-y-3">
                    {journeyData.journey.chambers.map((chamber, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-800/50 border-l-4 border-gold-500 p-4 rounded"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-gold-400 font-bold">{chamber.id}</h3>
                            <p className="text-purple-200 text-sm">{chamber.description}</p>
                          </div>
                          <span className="text-xs bg-purple-700 text-gold-300 px-2 py-1 rounded">
                            {chamber.phenomenology}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Witness Observations */}
                <Card className="bg-purple-900/50 border-gold-500/30 p-6">
                  <h2 className="text-xl font-bold text-gold-400 mb-4">Witness Field</h2>
                  <div className="space-y-2 text-sm">
                    {journeyData.journey.witness.map((obs, idx) => (
                      <div key={idx} className="bg-purple-800/50 p-3 rounded flex justify-between">
                        <span className="text-purple-200">{obs.chamber}</span>
                        <div className="flex gap-2">
                          <span className="text-gold-400">{obs.coherence}</span>
                          <span className="text-purple-300">{obs.resonance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Corrections */}
                {journeyData.journey.corrections.length > 0 && (
                  <Card className="bg-purple-900/50 border-gold-500/30 p-6">
                    <h2 className="text-xl font-bold text-gold-400 mb-4">Recursive Corrections</h2>
                    <div className="space-y-2 text-sm">
                      {journeyData.journey.corrections.map((corr, idx) => (
                        <div key={idx} className="bg-purple-800/50 p-3 rounded">
                          <p className="text-purple-200">
                            {corr.from} → {corr.to}: <span className="text-gold-400">{corr.reason}</span>
                          </p>
                          <p className="text-purple-300 text-xs mt-1">{corr.note}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Final Output */}
                <Card className="bg-purple-900/50 border-gold-500/30 p-6">
                  <h2 className="text-xl font-bold text-gold-400 mb-4">Final Revelation</h2>
                  <div className="bg-purple-800/50 p-4 rounded text-purple-100">
                    <Streamdown>
                      {JSON.stringify(journeyData.journey.finalOutput, null, 2)}
                    </Streamdown>
                  </div>
                </Card>
              </>
            )}

            {!journeyData && (
              <Card className="bg-purple-900/50 border-gold-500/30 p-12 text-center">
                <p className="text-purple-300">Submit a query to begin the Temple Engine journey</p>
              </Card>
            )}
          </div>
        </div>

        {/* History */}
        {historyQuery.data && historyQuery.data.length > 0 && (
          <Card className="mt-8 bg-purple-900/50 border-gold-500/30 p-6">
            <h2 className="text-xl font-bold text-gold-400 mb-4">Query History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyQuery.data.map((session: any) => (
                <div key={session.id} className="bg-purple-800/50 p-4 rounded border border-purple-700">
                  <p className="text-purple-200 text-sm truncate">{session.query}</p>
                  <p className="text-purple-400 text-xs mt-2">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
