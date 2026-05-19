import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: number;
  query: string;
  emotionalValence: number;
  urgency: number;
  createdAt: Date;
}

interface ProcessingHistoryLogProps {
  history: HistoryItem[];
  onSelectItem?: (item: HistoryItem) => void;
  onDeleteItem?: (id: number) => void;
  isLoading?: boolean;
}

export const ProcessingHistoryLog: React.FC<ProcessingHistoryLogProps> = ({
  history,
  onSelectItem,
  onDeleteItem,
  isLoading = false,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getValenceColor = (valence: number) => {
    if (valence > 0.3) return "text-green-400";
    if (valence < -0.3) return "text-red-400";
    return "text-yellow-400";
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency > 0.7) return "bg-red-900/50 border-red-600/50 text-red-200";
    if (urgency > 0.4) return "bg-yellow-900/50 border-yellow-600/50 text-yellow-200";
    return "bg-blue-900/50 border-blue-600/50 text-blue-200";
  };

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-950 to-indigo-950 border-purple-700/50 p-6">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className="text-purple-300">No processing history yet</p>
            <p className="text-xs text-purple-400 mt-2">Your queries will appear here</p>
          </div>
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
      <Card className="bg-gradient-to-br from-purple-950 to-indigo-950 border-purple-700/50 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-100 mb-2">Processing History</h3>
            <p className="text-xs text-purple-300">{history.length} previous query{history.length !== 1 ? "ies" : ""}</p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-black/30 rounded-lg border border-purple-600/30 hover:border-purple-500/50 transition-colors overflow-hidden">
                    <button
                      onClick={() => {
                        setExpandedId(expandedId === item.id ? null : item.id);
                        if (expandedId !== item.id) {
                          onSelectItem?.(item);
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/40 transition-colors"
                      disabled={isLoading}
                    >
                      <div className="flex-1 text-left">
                        <p className="text-sm text-purple-200 line-clamp-1">{item.query}</p>
                        <p className="text-xs text-purple-400 mt-1">{formatDate(item.createdAt)}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedId === item.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2"
                      >
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedId === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-purple-600/30 bg-black/20 px-4 py-3 space-y-3"
                        >
                          <div>
                            <p className="text-xs text-purple-300 mb-1">Full Query</p>
                            <p className="text-xs text-purple-200 bg-black/50 rounded p-2 max-h-20 overflow-y-auto">{item.query}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-purple-300 mb-1">Emotional Valence</p>
                              <p className={`text-sm font-semibold ${getValenceColor(item.emotionalValence)}`}>{item.emotionalValence.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-purple-300 mb-1">Urgency</p>
                              <Badge className={`${getUrgencyColor(item.urgency)} border`}>{item.urgency.toFixed(2)}</Badge>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-purple-600/20">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-8 border-purple-600/50 text-purple-200 hover:bg-purple-900/30"
                              onClick={() => onSelectItem?.(item)}
                              disabled={isLoading}
                            >
                              Reprocess
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-red-600/50 text-red-300 hover:bg-red-900/30"
                              onClick={() => {
                                onDeleteItem?.(item.id);
                                setExpandedId(null);
                              }}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
