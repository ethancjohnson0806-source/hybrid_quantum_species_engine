import React, { useEffect, useState } from 'react';
import { useSessionState } from '@/contexts/SessionStateProvider';
import ChamberTransitionGraph from '@/components/ChamberTransitionGraph';
import ChamberDetailPanel from '@/components/ChamberDetailPanel';

export default function ChamberFlowScreen() {
  const { session } = useSessionState();
  const [selectedChamber, setSelectedChamber] = useState(0);

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
    </div>
  );
}
