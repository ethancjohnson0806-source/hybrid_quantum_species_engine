import React from 'react';
import CorrectionCard from '@/components/CorrectionCard';

interface Props {
  corrections: any[];
}

export default function CorrectionTimeline({ corrections }: Props) {
  return (
    <div className="correction-timeline">
      {corrections.length === 0 ? (
        <p className="no-corrections">No corrections yet</p>
      ) : (
        corrections.map((correction, index) => (
          <CorrectionCard key={index} correction={correction} />
        ))
      )}
    </div>
  );
}
