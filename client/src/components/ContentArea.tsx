import React from 'react';
import ChamberFlowScreen from '@/components/screens/ChamberFlowScreen';
import WitnessFieldScreen from '@/components/screens/WitnessFieldScreen';
import CorrectionJournalScreen from '@/components/screens/CorrectionJournalScreen';

interface Props {
  activeScreen: string;
}

export default function ContentArea({ activeScreen }: Props) {
  return (
    <div className="content-area">
      {activeScreen === 'chamber-flow' && <ChamberFlowScreen />}
      {activeScreen === 'witness-field' && <WitnessFieldScreen />}
      {activeScreen === 'correction-journal' && <CorrectionJournalScreen />}
    </div>
  );
}
