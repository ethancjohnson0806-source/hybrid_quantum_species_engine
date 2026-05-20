import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, Zap, Eye, BookOpen } from "lucide-react";

// Type definitions
interface ChamberState {
  name: string;
  inputText: string;
  outputText: string;
  metrics: {
    coherenceScore: number;
    driftScore: number;
    symbolicDensity: number;
    ambiguityScore: number;
    correctionCount: number;
  };
  recursionDepth: number;
  enteredAt: Date;
  exitedAt?: Date;
}

interface WitnessState {
  overallCoherence: number;
  overallDrift: number;
  overallSymbolicDensity: number;
  alignmentScore: number;
  activeChamber: string;
  recursionDepth: number;
  totalCorrections: number;
}

interface JourneyTrace {
  userQuery: string;
  chambers: ChamberState[];
  witnessState: WitnessState;
  corrections: any[];
  finalAnswer: string;
  status: "completed" | "error";
}

// Shared Components

function MetricGauge({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = value > 0.7 ? "bg-green-500" : value > 0.4 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full transition-all duration-300`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ChamberCard({ chamber }: { chamber: ChamberState }) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-lg text-purple-200">{chamber.name}</CardTitle>
        <CardDescription>Recursion Depth: {chamber.recursionDepth}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Input:</p>
          <p className="text-sm text-gray-200 line-clamp-2">{chamber.inputText}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-2">Output:</p>
          <p className="text-sm text-gray-200 line-clamp-3">{chamber.outputText}</p>
        </div>
        <div className="space-y-2">
          <MetricGauge label="Coherence" value={chamber.metrics.coherenceScore} />
          <MetricGauge label="Drift" value={1 - chamber.metrics.driftScore} />
          <MetricGauge label="Clarity" value={1 - chamber.metrics.ambiguityScore} />
        </div>
      </CardContent>
    </Card>
  );
}

function CorrectionCard({ correction }: { correction: any }) {
  return (
    <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm text-red-200">{correction.chamberName}</CardTitle>
            <CardDescription>{correction.reason}</CardDescription>
          </div>
          <Badge variant={correction.severity === "major" ? "destructive" : "secondary"}>
            {correction.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-gray-300">{correction.deltaSummary}</p>
      </CardContent>
    </Card>
  );
}

// Main Home Component
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [userQuery, setUserQuery] = useState("");
  const [emotionalValence, setEmotionalValence] = useState(0.5);
  const [urgency, setUrgency] = useState(0.5);
  const [journey, setJourney] = useState<JourneyTrace | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("input");

  const processQueryMutation = trpc.templeEngine.processQuery.useMutation({
    onSuccess: (data) => {
      setJourney(data.journey);
      setIsProcessing(false);
      setActiveTab("chambers");
    },
    onError: (error) => {
      console.error("Error:", error);
      setIsProcessing(false);
    },
  });

  const handleProcessQuery = async () => {
    if (!userQuery.trim()) return;
    setIsProcessing(true);
    processQueryMutation.mutate({ userQuery });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-200 mb-4">Integrated Temple Engine</h1>
          <p className="text-gray-400">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-200 mb-2">Integrated Temple Engine</h1>
          <p className="text-gray-400">A mystical, unified query processing visualizer</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-purple-900/30 border border-purple-500/30">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="chambers" disabled={!journey}>
              Chambers
            </TabsTrigger>
            <TabsTrigger value="witness" disabled={!journey}>
              Witness Field
            </TabsTrigger>
            <TabsTrigger value="corrections" disabled={!journey || journey.corrections.length === 0}>
              Corrections
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle>Submit a Query</CardTitle>
                <CardDescription>Enter your question for the Temple Engine to process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Your Query</label>
                  <Textarea
                    placeholder="What is consciousness? How does learning work? Why do we dream?"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="bg-gray-900/50 border-purple-500/30 text-gray-100 placeholder-gray-500"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Emotional Valence: {Math.round(emotionalValence * 100)}%
                    </label>
                    <Slider
                      value={[emotionalValence]}
                      onValueChange={(value) => setEmotionalValence(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Urgency: {Math.round(urgency * 100)}%
                    </label>
                    <Slider
                      value={[urgency]}
                      onValueChange={(value) => setUrgency(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleProcessQuery}
                  disabled={isProcessing || !userQuery.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Process Query
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chambers Tab */}
          <TabsContent value="chambers" className="space-y-6">
            {journey && (
              <>
                <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle>Final Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-100 leading-relaxed">{journey.finalAnswer}</p>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-lg font-semibold text-purple-200 mb-4">Chamber Pipeline</h3>
                  <div className="grid gap-4">
                    {journey.chambers.map((chamber, idx) => (
                      <ChamberCard key={idx} chamber={chamber} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Witness Field Tab */}
          <TabsContent value="witness" className="space-y-6">
            {journey && (
              <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle>Witness Field Metrics</CardTitle>
                  <CardDescription>Real-time observation of the reasoning process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <MetricGauge label="Overall Coherence" value={journey.witnessState.overallCoherence} />
                    <MetricGauge label="Alignment Score" value={journey.witnessState.alignmentScore} />
                    <MetricGauge label="Clarity" value={1 - journey.witnessState.overallDrift} />
                    <MetricGauge label="Symbolic Density" value={journey.witnessState.overallSymbolicDensity} />
                  </div>

                  <div className="pt-4 border-t border-purple-500/30 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Active Chamber</span>
                      <span className="text-purple-200 font-semibold">{journey.witnessState.activeChamber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Recursion Depth</span>
                      <span className="text-purple-200 font-semibold">{journey.witnessState.recursionDepth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Corrections</span>
                      <span className="text-purple-200 font-semibold">{journey.witnessState.totalCorrections}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Corrections Tab */}
          <TabsContent value="corrections" className="space-y-6">
            {journey && journey.corrections.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-200">Correction Journal</h3>
                {journey.corrections.map((correction, idx) => (
                  <CorrectionCard key={idx} correction={correction} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
