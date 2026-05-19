import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Interpretation {
  content: string;
  coherence: number;
  resonance: number;
  entanglement?: string[];
}

interface InterpretationsPanelProps {
  interpretations: Interpretation[];
  title?: string;
}

export const InterpretationsPanel: React.FC<InterpretationsPanelProps> = ({
  interpretations,
  title = "Interpretations",
}) => {
  if (!interpretations || interpretations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-violet-950 to-purple-950 border-violet-700/50 p-6">
          <p className="text-purple-300 text-center">No interpretations available</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-violet-950 to-purple-950 border-violet-700/50 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-100 mb-2">{title}</h3>
            <p className="text-xs text-purple-300">{interpretations.length} interpretation{interpretations.length !== 1 ? "s" : ""} generated</p>
          </div>

          <div className="space-y-3">
            {interpretations.map((interp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-black/30 rounded-lg p-4 border border-violet-600/30 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-violet-900/50 border-violet-600/50 text-amber-200">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-purple-300">Coherence</p>
                      <p className="text-lg font-bold text-blue-400">{(interp.coherence * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-300">Resonance</p>
                      <p className="text-lg font-bold text-green-400">{(interp.resonance * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-purple-200 leading-relaxed mb-3">{interp.content}</p>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-purple-300">Coherence</span>
                      <span className="text-xs text-blue-400">{interp.coherence.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2 border border-blue-600/30 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${interp.coherence * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-purple-300">Resonance</span>
                      <span className="text-xs text-green-400">{interp.resonance.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2 border border-green-600/30 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${interp.resonance * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                {interp.entanglement && interp.entanglement.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-violet-600/20">
                    <p className="text-xs text-purple-300 mb-2">Entangled with:</p>
                    <div className="flex flex-wrap gap-2">
                      {interp.entanglement.map((ent, i) => (
                        <Badge key={i} variant="secondary" className="bg-violet-900/30 border-violet-600/30 text-purple-300 text-xs">
                          {ent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
