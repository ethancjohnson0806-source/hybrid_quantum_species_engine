import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CoherenceEvolutionChartProps {
  data: number[];
  title?: string;
}

export const CoherenceEvolutionChart: React.FC<CoherenceEvolutionChartProps> = ({
  data,
  title = "Coherence Evolution (Inner Court)",
}) => {
  const chartData = data.map((value, index) => ({
    iteration: index + 1,
    coherence: parseFloat(value.toFixed(3)),
  }));

  const maxCoherence = Math.max(...data);
  const minCoherence = Math.min(...data);
  const avgCoherence = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-700/50 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-100 mb-2">{title}</h3>
            <p className="text-xs text-purple-300">Tracks coherence score evolution across Inner Court iterations</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-3 border border-purple-600/30">
              <p className="text-xs text-purple-300 mb-1">Max Coherence</p>
              <p className="text-lg font-bold text-green-400">{maxCoherence.toFixed(3)}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-purple-600/30">
              <p className="text-xs text-purple-300 mb-1">Avg Coherence</p>
              <p className="text-lg font-bold text-blue-400">{avgCoherence}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-purple-600/30">
              <p className="text-xs text-purple-300 mb-1">Min Coherence</p>
              <p className="text-lg font-bold text-orange-400">{minCoherence.toFixed(3)}</p>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-purple-600/30">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="coherenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.2)" />
                <XAxis dataKey="iteration" stroke="#a855f7" style={{ fontSize: "12px" }} />
                <YAxis stroke="#a855f7" domain={[0, 1]} style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(251, 191, 36, 0.5)",
                    borderRadius: "0.5rem",
                    color: "#fbbf24",
                  }}
                  labelStyle={{ color: "#fbbf24" }}
                  formatter={(value) => [typeof value === "number" ? value.toFixed(3) : value, "Coherence"]}
                />
                <Legend wrapperStyle={{ color: "#fbbf24", fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="coherence"
                  stroke="#fbbf24"
                  fill="url(#coherenceGradient)"
                  dot={{ fill: "#fbbf24", r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-purple-600/30">
            <p className="text-xs text-purple-300 leading-relaxed">
              <span className="text-amber-200 font-semibold">Interpretation:</span> The chart shows how coherence scores evolve as the Inner Court processes interpretations. Higher coherence indicates stronger alignment with the query context.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
