import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

export interface WitnessMetrics {
  chamber: string;
  coherence: "LOW" | "MEDIUM" | "HIGH";
  drift: "NONE" | "MINOR" | "MAJOR";
  resonance: "WEAK" | "MODERATE" | "STRONG";
  alignment: "MISALIGNED" | "PARTIAL" | "ALIGNED";
  notes: string[];
}

interface WitnessFieldProps {
  observations: WitnessMetrics[];
  isProcessing?: boolean;
}

const getColorForMetric = (metric: string, value: string): string => {
  if (metric === "coherence") {
    switch (value) {
      case "LOW":
        return "text-red-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HIGH":
        return "text-green-400";
      default:
        return "text-purple-400";
    }
  }
  if (metric === "resonance") {
    switch (value) {
      case "WEAK":
        return "text-red-400";
      case "MODERATE":
        return "text-yellow-400";
      case "STRONG":
        return "text-emerald-400";
      default:
        return "text-purple-400";
    }
  }
  if (metric === "alignment") {
    switch (value) {
      case "MISALIGNED":
        return "text-red-400";
      case "PARTIAL":
        return "text-yellow-400";
      case "ALIGNED":
        return "text-cyan-400";
      default:
        return "text-purple-400";
    }
  }
  if (metric === "drift") {
    switch (value) {
      case "NONE":
        return "text-green-400";
      case "MINOR":
        return "text-yellow-400";
      case "MAJOR":
        return "text-red-400";
      default:
        return "text-purple-400";
    }
  }
  return "text-purple-400";
};

const getBgForMetric = (metric: string, value: string): string => {
  if (metric === "coherence") {
    switch (value) {
      case "LOW":
        return "bg-red-500/10";
      case "MEDIUM":
        return "bg-yellow-500/10";
      case "HIGH":
        return "bg-green-500/10";
      default:
        return "bg-purple-500/10";
    }
  }
  if (metric === "resonance") {
    switch (value) {
      case "WEAK":
        return "bg-red-500/10";
      case "MODERATE":
        return "bg-yellow-500/10";
      case "STRONG":
        return "bg-emerald-500/10";
      default:
        return "bg-purple-500/10";
    }
  }
  if (metric === "alignment") {
    switch (value) {
      case "MISALIGNED":
        return "bg-red-500/10";
      case "PARTIAL":
        return "bg-yellow-500/10";
      case "ALIGNED":
        return "bg-cyan-500/10";
      default:
        return "bg-purple-500/10";
    }
  }
  if (metric === "drift") {
    switch (value) {
      case "NONE":
        return "bg-green-500/10";
      case "MINOR":
        return "bg-yellow-500/10";
      case "MAJOR":
        return "bg-red-500/10";
      default:
        return "bg-purple-500/10";
    }
  }
  return "bg-purple-500/10";
};

export function WitnessField({ observations, isProcessing }: WitnessFieldProps) {
  const [displayedObservations, setDisplayedObservations] = useState<WitnessMetrics[]>([]);

  useEffect(() => {
    if (observations.length > 0) {
      // Animate observations appearing one by one
      const timer = setTimeout(() => {
        setDisplayedObservations(observations);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [observations]);

  if (displayedObservations.length === 0 && !isProcessing) {
    return (
      <Card className="bg-purple-900/50 border-gold-500/30 p-6">
        <h2 className="text-xl font-bold text-gold-400 mb-4">🔮 Witness Field</h2>
        <p className="text-purple-300 text-center py-8">
          The witness awaits observation...
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-purple-900/50 border-gold-500/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gold-400">🔮 Witness Field</h2>
        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gold-400">Observing...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {displayedObservations.map((obs, idx) => (
          <div
            key={idx}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="bg-purple-800/50 border border-purple-700 rounded-lg p-4 space-y-3">
              {/* Chamber Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-gold-400 font-semibold text-sm">
                  {obs.chamber}
                </h3>
                <span className="text-xs text-purple-400">Step {idx + 1}</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Coherence */}
                <div className={`${getBgForMetric("coherence", obs.coherence)} rounded p-2 border border-purple-600`}>
                  <p className="text-xs text-purple-300 mb-1">Coherence</p>
                  <p className={`text-sm font-bold ${getColorForMetric("coherence", obs.coherence)}`}>
                    {obs.coherence}
                  </p>
                </div>

                {/* Resonance */}
                <div className={`${getBgForMetric("resonance", obs.resonance)} rounded p-2 border border-purple-600`}>
                  <p className="text-xs text-purple-300 mb-1">Resonance</p>
                  <p className={`text-sm font-bold ${getColorForMetric("resonance", obs.resonance)}`}>
                    {obs.resonance}
                  </p>
                </div>

                {/* Alignment */}
                <div className={`${getBgForMetric("alignment", obs.alignment)} rounded p-2 border border-purple-600`}>
                  <p className="text-xs text-purple-300 mb-1">Alignment</p>
                  <p className={`text-sm font-bold ${getColorForMetric("alignment", obs.alignment)}`}>
                    {obs.alignment}
                  </p>
                </div>

                {/* Drift */}
                <div className={`${getBgForMetric("drift", obs.drift)} rounded p-2 border border-purple-600`}>
                  <p className="text-xs text-purple-300 mb-1">Drift</p>
                  <p className={`text-sm font-bold ${getColorForMetric("drift", obs.drift)}`}>
                    {obs.drift}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {obs.notes.length > 0 && (
                <div className="border-t border-purple-700 pt-2">
                  <p className="text-xs text-purple-400 space-y-1">
                    {obs.notes.map((note, noteIdx) => (
                      <div key={noteIdx} className="text-purple-300">
                        • {note}
                      </div>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {displayedObservations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-700">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <p className="text-purple-400">Avg Coherence</p>
              <p className="text-gold-400 font-bold">
                {displayedObservations.filter(o => o.coherence === "HIGH").length}/{displayedObservations.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-400">Resonance</p>
              <p className="text-emerald-400 font-bold">
                {displayedObservations.filter(o => o.resonance === "STRONG").length}/{displayedObservations.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-400">Alignment</p>
              <p className="text-cyan-400 font-bold">
                {displayedObservations.filter(o => o.alignment === "ALIGNED").length}/{displayedObservations.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-400">Drift-Free</p>
              <p className="text-green-400 font-bold">
                {displayedObservations.filter(o => o.drift === "NONE").length}/{displayedObservations.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
