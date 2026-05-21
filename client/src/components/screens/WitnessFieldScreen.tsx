import React from 'react';
import { useSessionState } from '@/contexts/SessionStateProvider';
import WitnessHalo from '@/components/WitnessHalo';
import WitnessMetricGrid from '@/components/WitnessMetricGrid';
import WitnessStatePanel from '@/components/WitnessStatePanel';

export default function WitnessFieldScreen() {
  const { session } = useSessionState();

  return (
    <div className="witness-field-screen">
      <div className="witness-field-header">
        <h2>Witness Field</h2>
        <p>Real-time observation of system coherence</p>
      </div>
      <div className="witness-field-content">
        <WitnessHalo witnessState={session?.witness_state} />
        <WitnessMetricGrid witnessState={session?.witness_state} />
        <WitnessStatePanel witnessState={session?.witness_state} />
      </div>
    </div>
  );
}
