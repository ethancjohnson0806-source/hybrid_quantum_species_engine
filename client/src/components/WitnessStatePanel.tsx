import React from 'react';

interface Props {
  witnessState: any;
}

export default function WitnessStatePanel({ witnessState }: Props) {
  if (!witnessState) return null;

  return (
    <div className="witness-state-panel">
      <div className="state-item">
        <label>Active Chamber</label>
        <span>{witnessState.active_chamber}</span>
      </div>
      <div className="state-item">
        <label>Recursion Depth</label>
        <span>{witnessState.recursion_depth}</span>
      </div>
      <div className="state-item">
        <label>Total Corrections</label>
        <span>{witnessState.total_corrections}</span>
      </div>
    </div>
  );
}
