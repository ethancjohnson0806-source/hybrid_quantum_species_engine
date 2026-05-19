import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface InputPanelProps {
  onSubmit: (query: string, emotionalValence: number, urgency: number) => void;
  isLoading?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onSubmit, isLoading = false }) => {
  const [query, setQuery] = useState("");
  const [emotionalValence, setEmotionalValence] = useState(0);
  const [urgency, setUrgency] = useState(0.5);

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query, emotionalValence, urgency);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-950 to-indigo-950 border-purple-700/50 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-amber-200 mb-3">Sacred Query</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your query to be processed through the Temple..."
              className="bg-black/30 border-purple-600/50 text-white placeholder-purple-400/50 focus:border-amber-500/50 focus:ring-amber-500/20 min-h-24 resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-purple-300 mt-2">Ctrl+Enter to submit</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-amber-200">Emotional Valence</label>
              <span className="text-xs text-purple-300 bg-black/30 px-2 py-1 rounded">{emotionalValence.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Negative</span>
              <Slider
                value={[emotionalValence]}
                onValueChange={(value) => setEmotionalValence(value[0])}
                min={-1}
                max={1}
                step={0.1}
                className="flex-1"
                disabled={isLoading}
              />
              <span className="text-xs text-green-400">Positive</span>
            </div>
            <p className="text-xs text-purple-300 mt-2">Ranges from -1 (negative) to 1 (positive)</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-amber-200">Urgency</label>
              <span className="text-xs text-purple-300 bg-black/30 px-2 py-1 rounded">{urgency.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400">Low</span>
              <Slider
                value={[urgency]}
                onValueChange={(value) => setUrgency(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
                disabled={isLoading}
              />
              <span className="text-xs text-orange-400">High</span>
            </div>
            <p className="text-xs text-purple-300 mt-2">Ranges from 0 (low) to 1 (high)</p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Processing...
                </div>
              ) : (
                "Process Through Temple"
              )}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
