import React from 'react';
import MetricGauge from '@/components/shared/MetricGauge';

interface Props {
  chamber: any;
}

export default function ChamberDetailPanel({ chamber }: Props) {
  return (
    <div className="chamber-detail-panel">
      <div className="chamber-header">
        <h3>{chamber.name}</h3>
      </div>
      <div className="chamber-content">
        <div className="chamber-input">
          <h4>Input</h4>
          <p>{chamber.input_text}</p>
        </div>
        <div className="chamber-output">
          <h4>Output</h4>
          <p>{chamber.output_text}</p>
        </div>
        <div className="chamber-metrics">
          <h4>Metrics</h4>
          <div className="metrics-grid">
            <MetricGauge label="Coherence" value={chamber.metrics?.coherence_score || 0} />
            <MetricGauge label="Drift" value={chamber.metrics?.drift_score || 0} />
            <MetricGauge label="Symbolic Density" value={chamber.metrics?.symbolic_density || 0} />
            <MetricGauge label="Ambiguity" value={chamber.metrics?.ambiguity_score || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
