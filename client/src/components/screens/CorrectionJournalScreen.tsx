import React from 'react';
import { useCorrectionJournal } from '@/contexts/CorrectionJournalProvider';
import CorrectionTimeline from '@/components/CorrectionTimeline';
import CorrectionFilterBar from '@/components/CorrectionFilterBar';
import CorrectionStatsPanel from '@/components/CorrectionStatsPanel';
import { Button } from '@/components/ui/button';

export default function CorrectionJournalScreen() {
  const { corrections } = useCorrectionJournal();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="correction-journal-screen">
      <div className="correction-journal-header">
        <h2>Correction Journal</h2>
        <p>All corrections and recursive re-entries</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        <Button variant="outline" size="sm" onClick={handleScrollToTop}>
          ↑ Return to Top
        </Button>
      </div>
      <div className="correction-journal-content">
        <CorrectionFilterBar />
        <CorrectionTimeline corrections={corrections} />
        <CorrectionStatsPanel corrections={corrections} />
      </div>
    </div>
  );
}
