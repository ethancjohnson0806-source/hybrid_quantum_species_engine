import { useState } from 'react';
import { useSessionState } from '@/contexts/SessionStateProvider';
import ChamberTransitionGraph from '@/components/ChamberTransitionGraph';
import ChamberDetailPanel from '@/components/ChamberDetailPanel';
import { Button } from '@/components/ui/button';

export default function ChamberFlowScreen() {
  const { session } = useSessionState();
  const [selectedChamber, setSelectedChamber] = useState(0);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="chamber-flow-screen">
      <div className="chamber-flow-header">
        <h2>Chamber Flow</h2>
        <p>Trace the query through the five chambers</p>
      </div>
      <div className="chamber-flow-content">
        <ChamberTransitionGraph 
          chambers={session?.chambers || []}
          selectedIndex={selectedChamber}
          onSelectChamber={setSelectedChamber}
        />
        {session?.chambers && session.chambers[selectedChamber] && (
          <ChamberDetailPanel chamber={session.chambers[selectedChamber]} />
        )}
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <Button variant="outline" size="sm" onClick={handleScrollToTop}>
          ↑ Return to Top
        </Button>
      </div>
    </div>
  );
}
