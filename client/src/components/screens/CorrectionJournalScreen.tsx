import React from 'react';
import { useCorrectionJournal } from '@/contexts/CorrectionJournalProvider';
import CorrectionTimeline from '@/components/CorrectionTimeline';
import CorrectionFilterBar from '@/components/CorrectionFilterBar';
import CorrectionStatsPanel from '@/components/CorrectionStatsPanel';

export default function CorrectionJournalScreen() {
  const { corrections } = useCorrectionJournal();

  return (
    <div className="correction-journal-screen">
      <div className="correction-journal-header">
        <h2>Correction Journal</h2>
        <p>All corrections and recursive re-entries</p>
      </div>
      <div className="correction-journal-content">
        <CorrectionFilterBar />
        <CorrectionTimeline corrections={corrections} />
        <CorrectionStatsPanel corrections={corrections} />
      </div>
    </div>
  );
}
