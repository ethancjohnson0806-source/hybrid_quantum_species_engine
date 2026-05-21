import React from 'react';

interface Props {
  label: string;
  value: number;
}

export default function MetricGauge({ label, value }: Props) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);
  const color = percentage < 40 ? '#ef4444' : percentage < 70 ? '#f59e0b' : '#10b981';

  return (
    <div className="metric-gauge">
      <label>{label}</label>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
      <span className="gauge-value">{percentage.toFixed(0)}%</span>
    </div>
  );
}
