import React from 'react';

interface Props {
  correction: any;
}

export default function CorrectionCard({ correction }: Props) {
  return (
    <div className={`correction-card severity-${correction.severity}`}>
      <div className="correction-header">
        <span className="chamber-name">{correction.chamber_name}</span>
        <span className="severity-badge">{correction.severity}</span>
      </div>
      <div className="correction-reason">
        <strong>Reason:</strong> {correction.reason}
      </div>
      <div className="correction-diff">
        <div className="before">
          <strong>Before:</strong> {correction.previous_output}
        </div>
        <div className="after">
          <strong>After:</strong> {correction.corrected_output}
        </div>
      </div>
      <div className="correction-delta">
        <strong>Change:</strong> {correction.delta_summary}
      </div>
      <div className="correction-timestamp">
        {new Date(correction.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
