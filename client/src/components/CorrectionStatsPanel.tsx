import React from 'react';

interface Props {
  corrections: any[];
}

export default function CorrectionStatsPanel({ corrections }: Props) {
  const statsByReason = new Map<string, number>();
  const statsByChamber = new Map<string, number>();
  const statsBySeverity = new Map<string, number>();

  corrections.forEach(c => {
    statsByReason.set(c.reason, (statsByReason.get(c.reason) || 0) + 1);
    statsByChamber.set(c.chamber_name, (statsByChamber.get(c.chamber_name) || 0) + 1);
    statsBySeverity.set(c.severity, (statsBySeverity.get(c.severity) || 0) + 1);
  });

  return (
    <div className="correction-stats-panel">
      <div className="stats-section">
        <h3>Corrections by Reason</h3>
        {Array.from(statsByReason.entries()).map(([reason, count]) => (
          <div key={reason} className="stat-item">
            <span>{reason}</span>
            <span className="stat-count">{count}</span>
          </div>
        ))}
      </div>
      <div className="stats-section">
        <h3>Corrections by Chamber</h3>
        {Array.from(statsByChamber.entries()).map(([chamber, count]) => (
          <div key={chamber} className="stat-item">
            <span>{chamber}</span>
            <span className="stat-count">{count}</span>
          </div>
        ))}
      </div>
      <div className="stats-section">
        <h3>Corrections by Severity</h3>
        {Array.from(statsBySeverity.entries()).map(([severity, count]) => (
          <div key={severity} className="stat-item">
            <span>{severity}</span>
            <span className="stat-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
