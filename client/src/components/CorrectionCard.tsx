import React, { useState } from 'react';

interface Props {
  correction: any;
}

export default function CorrectionCard({ correction }: Props) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`correction-card severity-${correction.severity}`}>
      <div className="correction-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="chamber-name">{correction.chamber_name}</span>
          <span className="severity-badge">{correction.severity}</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.5rem'
          }}
        >
          {isMinimized ? '▼' : '▲'}
        </button>
      </div>
      {!isMinimized && (
        <>
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
        </>
      )}
    </div>
  );
}
