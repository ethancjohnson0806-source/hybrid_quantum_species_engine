import React, { useState } from 'react';
import MetricGauge from '@/components/shared/MetricGauge';

interface Props {
  chamber: any;
}

export default function ChamberDetailPanel({ chamber }: Props) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="chamber-detail-panel">
      <div className="chamber-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{chamber.name}</h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c084fc',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.5rem'
          }}
        >
          {isMinimized ? '▼' : '▲'}
        </button>
      </div>
      {!isMinimized && (
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
      )}
    </div>
  );
}
