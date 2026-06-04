import React from 'react';
import { useSessionState } from '@/contexts/SessionStateProvider';
import WitnessHalo from '@/components/WitnessHalo';
import WitnessMetricGrid from '@/components/WitnessMetricGrid';
import WitnessStatePanel from '@/components/WitnessStatePanel';
import { Button } from '@/components/ui/button';

export default function WitnessFieldScreen() {
  const { session } = useSessionState();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <Button variant="outline" size="sm" onClick={handleScrollToTop}>
          ↑ Return to Top
        </Button>
      </div>
    </div>
  );
}
