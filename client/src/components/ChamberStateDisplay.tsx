import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface ChamberStateDisplayProps {
  chamber: string;
  title: string;
  data: Record<string, any>;
  isActive?: boolean;
}

export const ChamberStateDisplay: React.FC<ChamberStateDisplayProps> = ({
  chamber,
  title,
  data,
  isActive = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);

  const getChamberColor = (chamberName: string) => {
    const colors: Record<string, string> = {
      outer_court: "from-purple-900 to-purple-800",
      inner_court: "from-indigo-900 to-indigo-800",
      holy_place: "from-violet-900 to-violet-800",
      holy_of_holies: "from-amber-900 to-amber-800",
    };
    return colors[chamberName] || "from-gray-900 to-gray-800";
  };

  const getChamberBorderColor = (chamberName: string) => {
    const colors: Record<string, string> = {
      outer_court: "border-purple-600/50",
      inner_court: "border-indigo-600/50",
      holy_place: "border-violet-600/50",
      holy_of_holies: "border-amber-600/50",
    };
    return colors[chamberName] || "border-gray-600/50";
  };

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">null</span>;
    if (typeof value === "boolean") return <span className={value ? "text-green-400" : "text-red-400"}>{value.toString()}</span>;
    if (typeof value === "number") return <span className="text-blue-400">{value}</span>;
    if (typeof value === "string") return <span className="text-green-300">"{value.substring(0, 100)}{value.length > 100 ? "..." : ""}"</span>;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">[]</span>;
      return (
        <div className="ml-4 border-l border-purple-600/30 pl-4">
          {value.map((item, index) => (
            <div key={index} className="text-purple-200">[{index}]: {renderValue(item)}</div>
          ))}
        </div>
      );
    }
    if (typeof value === "object") {
      return (
        <div className="ml-4 border-l border-purple-600/30 pl-4">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="text-purple-200">
              <span className="text-amber-200">"{key}"</span>: {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-gray-400">{String(value)}</span>;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-br ${getChamberColor(chamber)} border-2 ${getChamberBorderColor(chamber)} overflow-hidden`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <h3 className="text-lg font-semibold text-amber-100">{title}</h3>
            <span className="text-xs text-purple-300 bg-black/30 px-2 py-1 rounded">{chamber}</span>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-5 h-5 text-amber-200" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-purple-600/30 overflow-hidden"
            >
              <div className="px-6 py-4 bg-black/20 max-h-96 overflow-y-auto">
                <pre className="text-xs text-purple-200 font-mono whitespace-pre-wrap break-words">{renderValue(data)}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
