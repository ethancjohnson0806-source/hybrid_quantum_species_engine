import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface TempleVisualizationProps {
  isProcessing: boolean;
  activeStep: "outer_court" | "inner_court" | "holy_place" | "holy_of_holies" | null;
}

export const TempleVisualization: React.FC<TempleVisualizationProps> = ({
  isProcessing,
  activeStep,
}) => {
  const chambers = [
    {
      id: "outer_court",
      name: "Outer Court",
      description: "Input & Symbolic Tagging",
      color: "from-purple-600 to-purple-500",
      borderColor: "border-purple-500",
      position: 0,
    },
    {
      id: "inner_court",
      name: "Inner Court",
      description: "Variational Meaning Space",
      color: "from-indigo-600 to-indigo-500",
      borderColor: "border-indigo-500",
      position: 1,
    },
    {
      id: "holy_place",
      name: "Holy Place",
      description: "Coherence & Constraints",
      color: "from-violet-600 to-violet-500",
      borderColor: "border-violet-500",
      position: 2,
    },
    {
      id: "holy_of_holies",
      name: "Holy of Holies",
      description: "Collapse & Unified Output",
      color: "from-amber-600 to-amber-500",
      borderColor: "border-amber-500",
      position: 3,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-black to-purple-950 border-purple-700/50 p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Sacred Four-Chamber Pipeline</h3>
            <p className="text-sm text-purple-300">Watch your query flow through the Temple architecture</p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {chambers.map((chamber, index) => (
                <motion.div
                  key={chamber.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative"
                >
                  <motion.div
                    className={`bg-gradient-to-br ${chamber.color} rounded-lg p-6 border-2 ${chamber.borderColor} relative overflow-hidden`}
                    animate={{
                      boxShadow:
                        activeStep === chamber.id
                          ? "0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.3)"
                          : "0 0 10px rgba(251, 191, 36, 0.1)",
                      scale: activeStep === chamber.id ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <motion.div
                          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                          animate={{
                            scale: activeStep === chamber.id ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.6, repeat: activeStep === chamber.id ? Infinity : 0 }}
                        >
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </motion.div>
                        {activeStep === chamber.id && (
                          <motion.div
                            className="w-3 h-3 rounded-full bg-green-400"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-white mb-1">{chamber.name}</h4>
                      <p className="text-xs text-white/70 mb-4">{chamber.description}</p>

                      <motion.div
                        className="h-1 bg-white/20 rounded-full overflow-hidden"
                        animate={{
                          backgroundColor:
                            activeStep === chamber.id ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <motion.div
                          className="h-full bg-white/80"
                          initial={{ width: 0 }}
                          animate={{
                            width: activeStep === chamber.id ? "100%" : 0,
                          }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {index < chambers.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-amber-400 to-transparent"
                      animate={{
                        opacity: activeStep === chamber.id ? 1 : 0.3,
                        x: activeStep === chamber.id ? [0, 4, 0] : 0,
                      }}
                      transition={{ duration: 0.8, repeat: activeStep === chamber.id ? Infinity : 0 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-4 border border-purple-600/30">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <p className="text-sm text-amber-100 font-semibold">
                {isProcessing
                  ? `Processing: ${
                      activeStep
                        ? activeStep.replace("_", " ").toUpperCase()
                        : "Initializing..."
                    }`
                  : "Ready for input"}
              </p>
            </div>
            <p className="text-xs text-purple-300">
              {isProcessing
                ? "Your query is flowing through the sacred chambers..."
                : "Submit a query to begin the Temple Engine processing"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {chambers.map((chamber) => (
              <div key={chamber.id} className="bg-black/30 rounded p-3 border border-purple-600/20">
                <p className="text-purple-300 font-semibold mb-1">{chamber.name}</p>
                <p className="text-purple-400 text-xs">{chamber.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
