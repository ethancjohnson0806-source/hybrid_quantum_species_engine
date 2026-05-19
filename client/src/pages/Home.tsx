import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { TempleVisualization } from "@/components/TempleVisualization";
import { InputPanel } from "@/components/InputPanel";
import { ChamberStateDisplay } from "@/components/ChamberStateDisplay";
import { CoherenceEvolutionChart } from "@/components/CoherenceEvolutionChart";
import { InterpretationsPanel } from "@/components/InterpretationsPanel";
import { FinalOutputPanel } from "@/components/FinalOutputPanel";
import { ProcessingHistoryLog } from "@/components/ProcessingHistoryLog";
import { Loader2 } from "lucide-react";

interface ChamberOutput {
  chamber: string;
  tag?: any;
  interpretations?: any[];
  constraints_applied?: string[];
  coherence_evolution?: number[];
  final_output?: any;
  path_trace?: any;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<"outer_court" | "inner_court" | "holy_place" | "holy_of_holies" | null>(null);
  const [chamberOutputs, setChamberOutputs] = useState<ChamberOutput[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const processQueryMutation = trpc.templeEngine.processQuery.useMutation();
  const historyQuery = trpc.templeEngine.getHistory.useQuery();
  const sessionDetailsQuery = trpc.templeEngine.getSessionDetails.useQuery(
    { sessionId: currentSessionId || 0 },
    { enabled: !!currentSessionId }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-amber-100 mb-4">Integrated Temple Engine</h1>
          <p className="text-purple-300 mb-8 max-w-md">
            A mystical, LLM-powered query processing visualizer that maps your input through a sacred four-chamber pipeline.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold px-8 py-3 rounded-lg"
          >
            Sign In to Begin
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleProcessQuery = async (query: string, emotionalValence: number, urgency: number) => {
    setIsProcessing(true);
    setChamberOutputs([]);
    setActiveStep(null);

    try {
      const result = await processQueryMutation.mutateAsync({
        query,
        emotionalValence,
        urgency,
      });

      setCurrentSessionId(result.sessionId);
      setChamberOutputs(result.chamberOutputs);

      const steps: Array<"outer_court" | "inner_court" | "holy_place" | "holy_of_holies"> = [
        "outer_court",
        "inner_court",
        "holy_place",
        "holy_of_holies",
      ];

      for (const step of steps) {
        setActiveStep(step);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setActiveStep(null);
    } catch (error) {
      console.error("Error processing query:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectHistoryItem = async (item: any) => {
    setCurrentSessionId(item.id);
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsProcessing(false);
  };

  const outerCourtData = chamberOutputs.find((c) => c.chamber === "outer_court");
  const innerCourtData = chamberOutputs.find((c) => c.chamber === "inner_court");
  const holyPlaceData = chamberOutputs.find((c) => c.chamber === "holy_place");
  const holyOfHoliesData = chamberOutputs.find((c) => c.chamber === "holy_of_holies");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950">
      <header className="border-b border-purple-700/30 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl font-bold text-amber-100">Integrated Temple Engine</h1>
            <p className="text-xs text-purple-300">Sacred Query Processing Visualizer</p>
          </motion.div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-300">Welcome, {user?.name || "Seeker"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <InputPanel onSubmit={handleProcessQuery} isLoading={isProcessing} />
        </section>

        {chamberOutputs.length > 0 && (
          <section>
            <TempleVisualization isProcessing={isProcessing} activeStep={activeStep} />
          </section>
        )}

        {chamberOutputs.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-100">Chamber Processing Results</h2>

            {outerCourtData && (
              <ChamberStateDisplay
                chamber="outer_court"
                title="Outer Court - Input & Symbolic Tagging"
                data={outerCourtData}
                isActive={activeStep === "outer_court"}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {innerCourtData && (
                <ChamberStateDisplay
                  chamber="inner_court"
                  title="Inner Court - Variational Meaning Space"
                  data={innerCourtData}
                  isActive={activeStep === "inner_court"}
                />
              )}
              {innerCourtData?.coherence_evolution && (
                <CoherenceEvolutionChart data={innerCourtData.coherence_evolution} />
              )}
            </div>

            {innerCourtData?.interpretations && (
              <InterpretationsPanel interpretations={innerCourtData.interpretations} title="Generated Interpretations" />
            )}

            {holyPlaceData && (
              <ChamberStateDisplay
                chamber="holy_place"
                title="Holy Place - Coherence & Constraints"
                data={holyPlaceData}
                isActive={activeStep === "holy_place"}
              />
            )}

            {holyOfHoliesData && (
              <FinalOutputPanel
                unifiedState={holyOfHoliesData.final_output || { content: "", coherence: 0, resonance: 0 }}
                pathTrace={holyOfHoliesData.path_trace}
              />
            )}
          </section>
        )}

        {historyQuery.data && (
          <section>
            <ProcessingHistoryLog history={historyQuery.data} onSelectItem={handleSelectHistoryItem} isLoading={isProcessing} />
          </section>
        )}
      </main>

      {isProcessing && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
            <p className="text-amber-200 font-semibold">Processing through the Temple...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
