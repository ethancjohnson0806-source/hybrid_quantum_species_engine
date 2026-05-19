import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface FinalOutputPanelProps {
  unifiedState: {
    content: string;
    coherence: number;
    resonance: number;
  };
  pathTrace?: {
    input?: string;
    chambers_traversed?: string[];
    final_collapse_point?: string;
  };
}

export const FinalOutputPanel: React.FC<FinalOutputPanelProps> = ({
  unifiedState,
  pathTrace,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-amber-950 to-yellow-950 border-amber-700/50 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-amber-100">Holy of Holies</h3>
              <p className="text-xs text-amber-300">Unified Output Collapse</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-amber-200">Unified State</h4>
            <div className="bg-black/30 rounded-lg p-4 border border-amber-600/30">
              <p className="text-sm text-amber-100 leading-relaxed">{unifiedState.content}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4 border border-amber-600/30">
              <p className="text-xs text-amber-300 mb-2">Final Coherence</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-400">{(unifiedState.coherence * 100).toFixed(0)}%</span>
                <span className="text-xs text-amber-200">({unifiedState.coherence.toFixed(3)})</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 mt-2 border border-blue-600/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${unifiedState.coherence * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-amber-600/30">
              <p className="text-xs text-amber-300 mb-2">Final Resonance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-400">{(unifiedState.resonance * 100).toFixed(0)}%</span>
                <span className="text-xs text-amber-200">({unifiedState.resonance.toFixed(3)})</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 mt-2 border border-green-600/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-600 to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${unifiedState.resonance * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          {pathTrace && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-amber-200">Path Trace</h4>
              <div className="bg-black/30 rounded-lg p-4 border border-amber-600/30 space-y-3">
                {pathTrace.chambers_traversed && pathTrace.chambers_traversed.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-300 mb-2">Chambers Traversed</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pathTrace.chambers_traversed.map((chamber, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="bg-amber-900/50 border border-amber-600/50 rounded px-2 py-1 text-xs text-amber-200">
                            {chamber.replace("_", " ").toUpperCase()}
                          </div>
                          {index < pathTrace.chambers_traversed!.length - 1 && (
                            <div className="mx-2 text-amber-600">→</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {pathTrace.final_collapse_point && (
                  <div>
                    <p className="text-xs text-amber-300 mb-2">Final Collapse Point</p>
                    <p className="text-sm text-amber-100 italic">"{pathTrace.final_collapse_point}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-black/30 rounded-lg p-4 border border-amber-600/30">
            <p className="text-xs text-amber-300 leading-relaxed">
              <span className="text-amber-200 font-semibold">Interpretation:</span> The unified state represents the final coherent output after processing through all four chambers.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
