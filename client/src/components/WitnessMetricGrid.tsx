import React from 'react';
import MetricGauge from '@/components/shared/MetricGauge';

interface Props {
  witnessState: any;
}

export default function WitnessMetricGrid({ witnessState }: Props) {
  if (!witnessState) return null;

  return (
    <div className="witness-metric-grid">
      <MetricGauge label="Overall Coherence" value={witnessState.overall_coherence} />
      <MetricGauge label="Overall Drift" value={witnessState.overall_drift} />
      <MetricGauge label="Symbolic Density" value={witnessState.overall_symbolic_density} />
      <MetricGauge label="Alignment" value={witnessState.alignment_score} />
    </div>
  );
}
